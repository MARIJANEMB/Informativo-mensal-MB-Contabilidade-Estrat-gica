migrate(
  (app) => {
    try {
      app.findFirstRecordByFilter('settings', "id != ''")
    } catch (e) {
      const collection = app.findCollectionByNameOrId('settings')
      const record = new Record(collection)
      app.save(record)
    }
  },
  (app) => {
    // no op
  },
)
