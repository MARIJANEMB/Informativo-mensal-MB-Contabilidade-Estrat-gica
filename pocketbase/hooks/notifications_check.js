routerAdd(
  'GET',
  '/backend/v1/notifications/check',
  (e) => {
    var notifications = []
    var today = new Date()
    today.setHours(0, 0, 0, 0)

    var tasks = []
    try {
      tasks = $app.findRecordsByFilter(
        'tarefas',
        "status != 'Concluída'",
        'data_vencimento',
        500,
        0,
      )
    } catch (_) {}

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i]
      var dueStr = task.getString('data_vencimento')
      if (!dueStr) continue
      var due = new Date(dueStr + 'T00:00:00')
      var diffDays = Math.round((due - today) / 86400000)
      var desc = task.getString('descricao') || 'Tarefa'
      var taskType = task.getString('tipo') || ''
      var taskId = task.id

      if (diffDays < 0) {
        notifications.push({
          id: taskId,
          type: 'overdue',
          title: desc,
          subtitle: taskType,
          days: diffDays,
        })
      } else if (diffDays === 0) {
        notifications.push({ id: taskId, type: 'urgent', title: desc, subtitle: taskType, days: 0 })
      } else if (diffDays <= 3) {
        notifications.push({
          id: taskId,
          type: 'warning',
          title: desc,
          subtitle: taskType,
          days: diffDays,
        })
      }
    }

    return e.json(200, { notifications: notifications })
  },
  $apis.requireAuth(),
)
