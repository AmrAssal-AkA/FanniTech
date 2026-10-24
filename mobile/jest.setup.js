const { notifyManager } = require('@tanstack/react-query');

// Execute scheduled notifications immediately so they are flushed synchronously inside act()
notifyManager.setScheduler((cb) => cb());

