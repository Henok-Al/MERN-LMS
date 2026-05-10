import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils"

const Form = FormProvider

function FormField({ ...props }) {
  return <Controller {...props} />;
}

function FormItem({ className, ...props }) {
  return (
    <div
      data-slot="form-item"
      className={cn("space-y-2", className)}
      {...props}
    />
  );
}

function FormLabel({ className, ...props }) {
  return (
    <label
      data-slot="form-label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function FormControl({ ...props }) {
  return <Slot data-slot="form-control" {...props} />;
}

function FormDescription({ className, ...props }) {
  return (
    <p
      data-slot="form-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({ className, children, ...props }) {
  const { formState } = useFormContext() || {};
  const { errors } = formState || {};

  if (!errors || Object.keys(errors).length === 0) {
    return null;
  }

  const firstErrorKey = Object.keys(errors)[0];
  const body = errors[firstErrorKey]?.message;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      className={cn("text-destructive text-sm font-medium", className)}
      {...props}
    >
      {children || body}
    </p>
  );
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}