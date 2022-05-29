// build widget
const widgetSize = (config.runsInWidget ? config.widgetFamily : 'extraLarge')
let widget

// set date format
const df = new DateFormatter()
df.dateFormat = 'y.MM.dd, HH:mm'

if (widgetSize == 'small') {
    widget = await buildSmallWidget()
} else if (widgetSize == 'extraLarge') {
    widget = await buildExtraLargeWidget()
} else {
    widget = await buildMediumLargeWidget()
}

// for when running in the editor
if (!config.runsInWidget) {
    switch (widgetSize) {
        case 'small':
            widget.presentSmall()
            break
        case 'medium':
            widget.presentMedium()
            break
        case 'large':
            widget.presentLarge()
            break
        case 'extraLarge':
            await widget.presentExtraLarge()
            break
    }
}

// show widget
widget.refreshAfterDate = new Date(Date.now() + (60 * 60 * 1000)) // 1 hour
Script.setWidget(widget)
Script.complete()

// functions
async function buildSmallWidget() {
    const list = new ListWidget()
    list.setPadding(10, 10, 10, 10)
    const vodsReq = await getVods(1)
    const vod = vodsReq.results[0]
    list.url = `https://archiv.wubbl0rz.tv/vods/watch/${vod.uuid}`

    const thumbnail = await loadImage(`https://api.wubbl0rz.tv/media/vods/${vod.filename}-sm.jpg`)
    const thumbStack = list.addStack()
    const thumbImg = thumbStack.addImage(thumbnail)
    thumbImg.imageSize = new Size(150, 84.37)
    thumbImg.cornerRadius = 12
    thumbImg.centerAlignImage()
    list.addSpacer()

    const vodRow = list.addStack()
    vodRow.layoutVertically()
    const vodTitle = vodRow.addText(vod.title)
    vodTitle.font = Font.semiboldSystemFont(14)
    vodTitle.lineLimit = 2;

    const vodDate = new Date(vod.date)
    const vodSubtitle = vodRow.addText(df.string(vodDate) + ' Uhr')
    vodSubtitle.textColor = new Color('#999')
    vodSubtitle.font = Font.regularSystemFont(12)
    list.addSpacer()

    return list
}

async function buildMediumLargeWidget() {
    const list = new ListWidget()
    const titleRow = list.addStack()
    const title = titleRow.addText('Wubbl0rz Vods')
    title.font = Font.boldSystemFont(26)

    list.addSpacer()

    const vodCount = (widgetSize == 'medium') ? 2 : 5
    const vodsReq = await getVods(vodCount)
    const vods = vodsReq.results

    await fillStack(list, vods)

    return list
}

async function buildExtraLargeWidget() {
    const list = new ListWidget()
    const titleRow = list.addStack()
    const title = titleRow.addText('Wubbl0rz Vods')
    title.font = Font.boldSystemFont(26)
    list.addSpacer()

    const vodsReq = await getVods(10)
    let vods = vodsReq.results

    vodsStack = list.addStack()
    vodsStack.layoutHorizontally()

    let vStack1 = vodsStack.addStack()
    vStack1.layoutVertically()
    vodsStack.addSpacer(30)
    let vStack2 = vodsStack.addStack()
    vStack2.layoutVertically()

    await fillStack(vStack1, vods.slice(0, 5))
    await fillStack(vStack2, vods.slice(5, 10))

    return list
}

async function fillStack(stack, vods) {
    for (let i = 0; i < vods.length; i++) {
        if (i != 0) {
            stack.addSpacer(5)
        }
        const thisRow = stack.addStack()
        thisRow.layoutHorizontally()
        thisRow.url = `https://archiv.wubbl0rz.tv/vods/watch/${vods[i].uuid}`
        thisRow.size = new Size(0, 57)

        const titleStack = thisRow.addStack()
        titleStack.layoutVertically()
        const vodTitle = titleStack.addText(vods[i].title)
        vodTitle.font = Font.semiboldSystemFont(16)
        vodTitle.lineLimit = 2;

        const vodDate = new Date(vods[i].date)
        const vodSubtitle = titleStack.addText(df.string(vodDate) + ' Uhr')
        vodSubtitle.textColor = new Color('#999')
        vodSubtitle.font = Font.regularSystemFont(14)

        thisRow.addSpacer()
        const img = await loadImage(`https://api.wubbl0rz.tv/media/vods/${vods[i].filename}-sm.jpg`)
        const imgStack = thisRow.addImage(img)
        imgStack.imageSize = new Size(88.89, 50)
        imgStack.cornerRadius = 8
        imgStack.rightAlignImage()
    }
}

async function getVods(count) {
    const apiUrl = 'https://api.wubbl0rz.tv/vods?page_size=' + count;
    const request = new Request(apiUrl)
    return await request.loadJSON();
}

async function loadImage(url) {
    const req = new Request(url)
    const img = await req.loadImage()
    return img
}
