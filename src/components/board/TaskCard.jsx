const priorityConfig = {
  low: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  medium: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  high: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  urgent: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const TaskCard = ({ card, onClick }) => {
  const priority = priorityConfig[card.priority] || priorityConfig.medium;

  const formattedDate = card.dueDate
    ? new Date(card.dueDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    : null;

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all group"
      onClick={onClick}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
        <span className={`text-[10px] font-medium uppercase ${priority.text}`}>
          {card.priority}
        </span>
      </div>

      <h4 className="text-sm font-medium text-gray-800 leading-snug mb-1">
        {card.title}
      </h4>

      {card.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {card.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-semibold">
              {card.assignee.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500">{card.assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-300">Unassigned</span>
        )}

        {formattedDate && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formattedDate}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
