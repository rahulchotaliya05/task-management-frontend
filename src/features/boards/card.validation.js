import * as Yup from "yup";

export const cardValidation = Yup.object({
  title: Yup.string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters")
    .required("Title is required"),
  description: Yup.string().max(2000, "Description cannot exceed 2000 characters"),
  assignee: Yup.string().nullable(),
  dueDate: Yup.string().nullable(),
  priority: Yup.string().oneOf(["low", "medium", "high", "urgent"]).required("Priority is required"),
});
