onRecordCreate((e) => {
  const views = e.record.getInt('views') || 0
  const likes = e.record.getInt('likes') || 0
  const comments = e.record.getInt('comments') || 0
  const shares = e.record.getInt('shares') || 0
  const saves = e.record.getInt('saves') || 0
  if (views > 0) {
    const rate = (likes + comments + shares + saves) / views
    e.record.set('engagement_rate', Math.round(rate * 10000) / 10000)
  } else {
    e.record.set('engagement_rate', 0)
  }
  if (!e.record.getString('status')) {
    e.record.set('status', 'pending')
  }
  e.next()
}, 'social_posts')

onRecordUpdate((e) => {
  const views = e.record.getInt('views') || 0
  const likes = e.record.getInt('likes') || 0
  const comments = e.record.getInt('comments') || 0
  const shares = e.record.getInt('shares') || 0
  const saves = e.record.getInt('saves') || 0
  if (views > 0) {
    const rate = (likes + comments + shares + saves) / views
    e.record.set('engagement_rate', Math.round(rate * 10000) / 10000)
  } else {
    e.record.set('engagement_rate', 0)
  }
  e.next()
}, 'social_posts')

onRecordAfterCreateSuccess((e) => {
  try {
    const allPosts = $app.findRecordsByFilter('social_posts', '', '-engagement_rate', 0, 0)
    const total = allPosts.length
    if (total === 0) return
    const threshold = Math.max(1, Math.ceil(total * 0.25))
    for (let i = 0; i < total; i++) {
      const isTop = i < threshold
      const record = $app.findRecordById('social_posts', allPosts[i].id)
      if (record.getBool('is_top_performer') !== isTop) {
        record.set('is_top_performer', isTop)
        $app.saveNoValidate(record)
      }
    }
  } catch (err) {
    $app.logger().error('Failed to recompute is_top_performer on create', 'error', err.message)
  }
}, 'social_posts')

onRecordAfterUpdateSuccess((e) => {
  try {
    const allPosts = $app.findRecordsByFilter('social_posts', '', '-engagement_rate', 0, 0)
    const total = allPosts.length
    if (total === 0) return
    const threshold = Math.max(1, Math.ceil(total * 0.25))
    for (let i = 0; i < total; i++) {
      const isTop = i < threshold
      const record = $app.findRecordById('social_posts', allPosts[i].id)
      if (record.getBool('is_top_performer') !== isTop) {
        record.set('is_top_performer', isTop)
        $app.saveNoValidate(record)
      }
    }
  } catch (err) {
    $app.logger().error('Failed to recompute is_top_performer on update', 'error', err.message)
  }
}, 'social_posts')

onRecordAfterDeleteSuccess((e) => {
  try {
    const allPosts = $app.findRecordsByFilter('social_posts', '', '-engagement_rate', 0, 0)
    const total = allPosts.length
    if (total === 0) return
    const threshold = Math.max(1, Math.ceil(total * 0.25))
    for (let i = 0; i < total; i++) {
      const isTop = i < threshold
      const record = $app.findRecordById('social_posts', allPosts[i].id)
      if (record.getBool('is_top_performer') !== isTop) {
        record.set('is_top_performer', isTop)
        $app.saveNoValidate(record)
      }
    }
  } catch (err) {
    $app.logger().error('Failed to recompute is_top_performer on delete', 'error', err.message)
  }
}, 'social_posts')
