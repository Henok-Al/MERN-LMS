const fs = require('fs');
const file = 'create-course.jsx';
let c = fs.readFileSync(file, 'utf8');

// Find the onSave function and replace it
const oldOnSave = `  const onSave = async (data) => {
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(\`/courses/${id}\`, data);
        toast.success("Course updated successfully");
      } else {
        await api.post("/courses", data);
        toast.success("Course created successfully");
      }
      navigate("/instructor/courses");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };`;

const newOnSave = `  const onSave = async (data) => {
    setSaving(true);
    try {
      if (isEditing) {
        await api.put(\`/courses/${id}\`, data);
        toast.success("Course updated successfully");
        navigate("/instructor/courses");
      } else {
        // Create course and switch to curriculum tab
        const res = await api.post("/courses", data);
        const newCourse = res.data.data;
        setCreatedCourseId(newCourse._id);
        setCourseCreated(true);
        setActiveTab("curriculum");
        toast.success("Course created! Now add your curriculum.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };`;

if (c.includes(oldOnSave)) {
  c = c.replace(oldOnSave, newOnSave);
  fs.writeFileSync(file, c);
  console.log('onSave function updated successfully');
} else {
  console.log('ERROR: Could not find exact onSave function pattern');
}
