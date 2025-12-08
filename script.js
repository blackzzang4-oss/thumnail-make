// 유튜브 썸네일 추출기 - JavaScript

// DOM 요소 가져오기
const urlInput = document.getElementById('youtube-url');
const extractBtn = document.getElementById('extract-btn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const thumbnailResult = document.getElementById('thumbnail-result');
const thumbnailImage = document.getElementById('thumbnail-image');
const videoIdSpan = document.getElementById('video-id');

// 다운로드 버튼들
const downloadMaxRes = document.getElementById('download-maxres');
const downloadHQ = document.getElementById('download-hq');
const downloadMQ = document.getElementById('download-mq');
const downloadSD = document.getElementById('download-sd');

// 유튜브 비디오 ID 추출 함수
function extractVideoId(url) {
    // 다양한 유튜브 URL 형식 지원
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/ // 직접 비디오 ID 입력
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

// 썸네일 URL 생성 함수
function getThumbnailUrls(videoId) {
    return {
        maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        sd: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        default: `https://img.youtube.com/vi/${videoId}/default.jpg`
    };
}

// 에러 메시지 표시 함수
function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.add('show');
    loading.classList.remove('show');
    thumbnailResult.classList.remove('show');
}

// 에러 메시지 숨기기 함수
function hideError() {
    errorMessage.classList.remove('show');
}

// 로딩 표시 함수
function showLoading() {
    loading.classList.add('show');
    hideError();
    thumbnailResult.classList.remove('show');
}

// 로딩 숨기기 함수
function hideLoading() {
    loading.classList.remove('show');
}

// 썸네일 결과 표시 함수
function showThumbnail(videoId, thumbnailUrls) {
    // 비디오 ID 표시
    videoIdSpan.textContent = videoId;

    // 썸네일 이미지 설정 (최대 해상도 우선, 없으면 고화질로 폴백)
    const img = new Image();
    img.onload = function () {
        thumbnailImage.src = thumbnailUrls.maxres;
        thumbnailImage.alt = `유튜브 비디오 ${videoId}의 썸네일`;
        setupDownloadButtons(videoId, thumbnailUrls);
        hideLoading();
        thumbnailResult.classList.add('show');
    };
    img.onerror = function () {
        // maxresdefault가 없으면 hqdefault 사용
        thumbnailImage.src = thumbnailUrls.hq;
        thumbnailImage.alt = `유튜브 비디오 ${videoId}의 썸네일`;
        setupDownloadButtons(videoId, thumbnailUrls);
        hideLoading();
        thumbnailResult.classList.add('show');
    };
    img.src = thumbnailUrls.maxres;
}

// 다운로드 버튼 설정 함수
function setupDownloadButtons(videoId, thumbnailUrls) {
    // 파일명 생성
    const timestamp = new Date().getTime();

    // 각 다운로드 버튼에 URL 설정
    downloadMaxRes.href = thumbnailUrls.maxres;
    downloadMaxRes.download = `youtube-thumbnail-${videoId}-maxres-${timestamp}.jpg`;

    downloadHQ.href = thumbnailUrls.hq;
    downloadHQ.download = `youtube-thumbnail-${videoId}-hq-${timestamp}.jpg`;

    downloadMQ.href = thumbnailUrls.mq;
    downloadMQ.download = `youtube-thumbnail-${videoId}-mq-${timestamp}.jpg`;

    downloadSD.href = thumbnailUrls.sd;
    downloadSD.download = `youtube-thumbnail-${videoId}-sd-${timestamp}.jpg`;

    // 다운로드 버튼 클릭 이벤트 (크로스 오리진 문제 해결)
    [downloadMaxRes, downloadHQ, downloadMQ, downloadSD].forEach(btn => {
        btn.addEventListener('click', async function (e) {
            e.preventDefault();
            const url = this.href;
            const filename = this.download;

            try {
                // fetch를 사용하여 이미지 다운로드
                const response = await fetch(url);
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                // 임시 링크 생성 및 클릭
                const tempLink = document.createElement('a');
                tempLink.href = blobUrl;
                tempLink.download = filename;
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);

                // 메모리 정리
                window.URL.revokeObjectURL(blobUrl);
            } catch (error) {
                // fetch 실패 시 직접 링크로 시도
                window.open(url, '_blank');
            }
        });
    });
}

// 썸네일 추출 메인 함수
function extractThumbnail() {
    const url = urlInput.value.trim();

    // 입력 검증
    if (!url) {
        showError('유튜브 영상 URL을 입력해주세요.');
        return;
    }

    // 비디오 ID 추출
    const videoId = extractVideoId(url);

    if (!videoId) {
        showError('올바른 유튜브 URL이 아닙니다. URL을 확인해주세요.');
        return;
    }

    // 로딩 표시
    showLoading();

    // 썸네일 URL 생성
    const thumbnailUrls = getThumbnailUrls(videoId);

    // 썸네일 표시 (약간의 지연 후 - 사용자 경험 향상)
    setTimeout(() => {
        showThumbnail(videoId, thumbnailUrls);
    }, 500);
}

// 이벤트 리스너 등록
extractBtn.addEventListener('click', extractThumbnail);

// Enter 키로도 추출 가능
urlInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        extractThumbnail();
    }
});

// 입력 필드 포커스 시 에러 메시지 숨기기
urlInput.addEventListener('focus', hideError);

// 페이지 로드 시 입력 필드에 포커스
window.addEventListener('load', function () {
    urlInput.focus();
});

// URL 파라미터에서 비디오 ID 자동 추출 (선택적 기능)
window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const videoParam = urlParams.get('v') || urlParams.get('video');

    if (videoParam) {
        urlInput.value = `https://www.youtube.com/watch?v=${videoParam}`;
        extractThumbnail();
    }
});

// 붙여넣기 시 자동 추출 (선택적 기능 - 사용자 편의성)
urlInput.addEventListener('paste', function (e) {
    // 붙여넣기 후 약간의 지연을 두고 자동 추출
    setTimeout(() => {
        const pastedText = urlInput.value.trim();
        if (pastedText && extractVideoId(pastedText)) {
            // 자동 추출은 선택적이므로 주석 처리
            // extractThumbnail();
        }
    }, 100);
});
