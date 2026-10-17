

export const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-400 text-xs font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />
            Critical Priority
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 text-xs font-semibold">
            High Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 text-xs font-semibold">
            Normal Priority
          </span>
        );
    }
  };