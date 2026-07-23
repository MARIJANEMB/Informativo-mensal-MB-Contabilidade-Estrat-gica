migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('settings')
    if (!col.fields.getByName('notification_email')) {
      col.fields.add(new TextField({ name: 'notification_email' }))
    }
    if (!col.fields.getByName('slack_webhook_url')) {
      col.fields.add(new TextField({ name: 'slack_webhook_url' }))
    }
    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('settings')
    var f1 = col.fields.getByName('notification_email')
    if (f1) col.fields.remove(f1)
    var f2 = col.fields.getByName('slack_webhook_url')
    if (f2) col.fields.remove(f2)
    app.save(col)
  },
)
