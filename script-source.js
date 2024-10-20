       // Constants for Google Sheets
const VIDEO_SHEET_ID = '1XkBEUnx3I8uZXtc_wX0HvzQx-dy0mwf4dEA-4kNU_6Q';
const VIDEO_SHEET_TITLE = 'Sheet1';
const VIDEO_SHEET_RANGE = 'A:B';

async function getYouTubeIds() {
    const FULL_URL = `https://docs.google.com/spreadsheets/d/${VIDEO_SHEET_ID}/gviz/tq?sheet=${VIDEO_SHEET_TITLE}&range=${VIDEO_SHEET_RANGE}`;

    const response = await fetch(FULL_URL);
    const text = await response.text();
    const data = JSON.parse(text.substr(47).slice(0, -2));

    return {
        youtubeIdVIDEO5: data.table.rows[0].c[1].v,
        youtubeIdVIDEO8: data.table.rows[1].c[1].v,
        youtubeIdVIDEO1: data.table.rows[2].c[1].v,
        youtubeIdVIDEO4: data.table.rows[2].c[1].v
    };
}

function insertVideo(containerId, youtubeId, widgetId) {
    const container = document.querySelector(`#${containerId} .ladi-video`);
    const iframe = document.createElement('iframe');
    iframe.id = `${containerId}_player`;
    iframe.className = 'iframe-video-preload';
    iframe.style.cssText = 'position: absolute; width: 100%; height: 100%; top: 0; left: 0;';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; autoplay';
    iframe.allowFullscreen = true;
    iframe.src = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=0&playsinline=1&controls=1&enablejsapi=1&origin=https%3A%2F%2Fpreview.ldpdemo.com&widgetid=${widgetId}&autoplay=1&mute=1`;
    container.innerHTML = '';
    container.appendChild(iframe);
}

document.addEventListener('DOMContentLoaded', async function() {
    const {youtubeIdVIDEO5, youtubeIdVIDEO8, youtubeIdVIDEO1,youtubeIdVIDEO4} = await getYouTubeIds();
    
    document.getElementById('SHAPE4').addEventListener('click', () => insertVideo('VIDEO4', youtubeIdVIDEO4, 1));
    document.getElementById('VIDEO4').addEventListener('click', () => insertVideo('VIDEO4', youtubeIdVIDEO4, 1));

    document.getElementById('SHAPE5').addEventListener('click', () => insertVideo('VIDEO5', youtubeIdVIDEO5, 1));
    document.getElementById('VIDEO5').addEventListener('click', () => insertVideo('VIDEO5', youtubeIdVIDEO5, 1));

    document.getElementById('SHAPE8').addEventListener('click', () => insertVideo('VIDEO8', youtubeIdVIDEO8, 2));
    document.getElementById('VIDEO8').addEventListener('click', () => insertVideo('VIDEO8', youtubeIdVIDEO8, 2));

    document.getElementById('SHAPE1').addEventListener('click', () => insertVideo('VIDEO1', youtubeIdVIDEO1, 3));
    document.getElementById('VIDEO1').addEventListener('click', () => insertVideo('VIDEO1', youtubeIdVIDEO1, 3));
});
