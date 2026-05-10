import Stripe from "stripe";
import Enrollment from "../../models/Enrollment.js";
import Course from "../../models/Course.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Create Stripe checkout session
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Check already enrolled
    const existing = await Enrollment.findOne({
      userId: req.user._id,
      courseId,
      status: "Active",
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled in this course" });
    }

    // Free course - enroll directly
    if (!course.pricing || course.pricing === 0) {
      const enrollment = await Enrollment.create({
        userId: req.user._id,
        courseId,
        amount: 0,
        status: "Active",
        paymentStatus: "completed",
      });
      return res.status(201).json({
        success: true,
        data: enrollment,
        message: "Enrolled successfully",
      });
    }

    // Paid course - create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: req.user.userEmail,
      metadata: {
        courseId: courseId,
        userId: req.user._id,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.subtitle || course.smallDescription || "",
              images: course.image ? [course.image] : [],
            },
            unit_amount: Math.round(course.pricing * 100), // cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/success?session_id={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancel`,
    });

    res.status(200).json({
      success: true,
      data: { url: session.url, sessionId: session.id },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment after redirect
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === "paid") {
      const { courseId, userId } = session.metadata;
      
      const existing = await Enrollment.findOne({ userId, courseId });
      if (!existing) {
        await Enrollment.create({
          userId,
          courseId,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          status: "Active",
          paymentStatus: "completed",
          stripeSessionId: sessionId,
        });
      } else if (existing.status !== "Active") {
        existing.status = "Active";
        existing.paymentStatus = "completed";
        await existing.save();
      }

      return res.status(200).json({ success: true, message: "Payment verified" });
    }

    res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Stripe webhook handler
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_placeholder"
    );
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  // Handle checkout completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { courseId, userId } = session.metadata;

    try {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(200).json({ received: true });
      }

      // Check not already enrolled
      const existing = await Enrollment.findOne({ userId, courseId });
      if (!existing) {
        await Enrollment.create({
          userId,
          courseId,
          amount: course.pricing,
          status: "Active",
          paymentStatus: "completed",
          stripeSessionId: session.id,
        });
      } else if (existing.status !== "Active") {
        existing.status = "Active";
        existing.paymentStatus = "completed";
        existing.stripeSessionId = session.id;
        await existing.save();
      }
    } catch (err) {
      console.error("Webhook enrollment error:", err);
    }
  }

  res.status(200).json({ received: true });
};