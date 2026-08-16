import { useFormik } from "formik";
import { cardValidation } from "../../features/boards/card.validation";
import { Modal, Button, Input, Select } from "../common";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const CardModal = ({ isOpen, onClose, onSubmit, initialValues, members = [], loading = false }) => {
  const isEditing = !!initialValues?._id;

  const formik = useFormik({
    initialValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      assignee: initialValues?.assignee?._id || initialValues?.assignee || "",
      dueDate: initialValues?.dueDate
        ? new Date(initialValues.dueDate).toISOString().split("T")[0]
        : "",
      priority: initialValues?.priority || "medium",
    },
    validationSchema: cardValidation,
    enableReinitialize: true,
    onSubmit: (values) => {
      const data = {
        ...values,
        assignee: values.assignee || null,
        dueDate: values.dueDate || null,
      };
      onSubmit(data);
    },
  });

  const memberOptions = members.map((m) => ({
    value: m._id,
    label: m.name,
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Card" : "Create Card"}>
      <form onSubmit={formik.handleSubmit}>
        <Input
          label="Title"
          name="title"
          placeholder="Card title"
          value={formik.values.title}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.title}
          touched={formik.touched.title}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Add a description..."
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <Select
          label="Priority"
          name="priority"
          options={priorityOptions}
          value={formik.values.priority}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.priority}
          touched={formik.touched.priority}
        />

        <Select
          label="Assignee"
          name="assignee"
          options={memberOptions}
          value={formik.values.assignee}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={formik.values.dueDate}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        <div className="flex justify-end gap-2 mt-5">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CardModal;
