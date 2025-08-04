document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // 状態管理用の変数
    // =========================================
    let isOpened = false;        // ボトムシートが開いているかどうか
    let isDragging = false;      // ドラッグ操作中かどうか（ドラッグバーまたはコンテンツからの操作）
    let startY;                  // タッチ/クリック開始時のY座標（ドラッグ開始位置）
    let currentY;                // 現在のタッチ/クリック位置のY座標（現在のドラッグ位置）
    let lastTouchY = 0;          // 直前のタッチ位置のY座標（移動量計算用）
    let dragInitiated = false;   // ドラッグ操作が正式に開始されたかどうか（方向判定後）
    let isActiveScroll = false;  // コンテンツのスクロール操作中かどうか（スクロール中のドラッグ制御用）
    let scrollStartPosition = null; // スクロール開始時のスクロール位置（スクロール方向判定用）
    let swipeStartY = null;      // スワイプ開始時のY座標（ボトムシートを閉じるスワイプ操作用）
    let isSwipeClosing = false;  // スワイプによる閉じる操作中かどうか（閉じるスワイプ動作の制御用）

    // =========================================
    // DOM要素の取得
    // =========================================
    const bottomSheet = document.querySelector('.bottom-sheet');      // ボトムシート本体
    const openButton = document.querySelector('.open-bottom-sheet-button'); // 開くボタン
    const closeButton = document.querySelector('.close-button');      // 閉じるボタン
    const mask = document.querySelector('.mask');                     // 背景マスク
    const content = document.querySelector('.content');               // スクロール可能なコンテンツ領域
    const dragBar = document.querySelector('.sheet-drag-bar');        // ドラッグ操作用のバー

    // モーダルが開いてるかチェックする関数
    function isModalOpen() {
        return document.querySelector(".image-modal") !== null;
    }
    
    /**
     * スクロール位置とドラッグ方向に基づいてドラッグ開始可能か判定する関数
     * コンテンツのスクロール状態に応じて適切なドラッグ操作を許可する
     * 
     * @param {number} deltaY - ドラッグ方向（正：下向き、負：上向き）
     * @returns {boolean} ドラッグ開始可能かどうか
     */
    function canInitiateDrag(deltaY) {
        // スクロール位置の判定
        const isAtTop = content.scrollTop === 0;  // コンテンツが最上部にあるか
        const isAtBottom = Math.abs(content.scrollTop + content.clientHeight - content.scrollHeight) < 1;  // コンテンツが最下部にあるか

        // スクロール操作中の特別な制御
        // スクロール中に端に到達した場合は、スクロール開始位置を考慮してドラッグを制御
        if (isActiveScroll && ((isAtTop && scrollStartPosition > 0) || (isAtBottom && scrollStartPosition < content.scrollHeight - content.clientHeight))) {
            return false;  // スクロール操作中は意図しないドラッグを防止
        }

        // 通常のドラッグ方向制御
        // コンテンツの位置に応じて許可する方向を制限
        if (isAtTop) {
            return deltaY > 0;  // 最上部では下向きのみ許可
        } else if (isAtBottom) {
            return deltaY < 0;  // 最下部では上向きのみ許可
        }
        return false;  // それ以外の位置ではドラッグを許可しない
    }

    /**
     * タッチ/マウス操作開始時の処理
     * ドラッグバーとコンテンツ領域それぞれの操作開始を制御
     * 
     * @param {Event} e - タッチ/マウスイベント
     */
    function dragStart(e) {

        if (isModalOpen()) return; // モーダル表示中、ドラッグ禁止

        // ドラッグバーからの操作
        if (e.target === dragBar) {
            isDragging = true;  // ドラッグ操作開始
            dragInitiated = true;  // 即座にドラッグ開始を許可
            startY = e.touches ? e.touches[0].clientY : e.clientY;  // タッチ/クリック開始位置を記録
            lastTouchY = startY;
            e.preventDefault();  // デフォルトの動作を防止
            return;
        }

        // コンテンツ領域からの操作
        if (e.target.closest('.content')) {
            startY = e.touches ? e.touches[0].clientY : e.clientY;
            lastTouchY = startY;
            dragInitiated = false;  // ドラッグ開始は保留（方向判定後に許可）
            scrollStartPosition = content.scrollTop;  // スクロール開始位置を記録
            isActiveScroll = true;  // スクロール操作開始

            // コンテンツが少なく、スクロールが発生しない場合の処理
            if (content.scrollHeight <= content.clientHeight) {
                isDragging = true;  // ドラッグ操作開始
                dragInitiated = true;  // 即座にドラッグ開始を許可
                e.preventDefault();  // デフォルトの動作を防止
            }
        }
    }

    /**
     * タッチ/マウス移動時の処理
     * ドラッグ操作とスクロール操作の制御を行う
     * 
     * @param {Event} e - タッチ/マウスイベント
     */
    function dragging(e) {
        if (!isOpened) return;  // ボトムシートが閉じている場合は何もしない
        
        currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - lastTouchY;  // 移動量を計算
        
        if (isDragging) {
            e.preventDefault();
            // ドラッグ中の場合、ボトムシートの位置を更新
            const newTop = parseInt(getComputedStyle(bottomSheet).top) + deltaY;
            bottomSheet.style.top = `${newTop}px`;
            bottomSheet.style.transition = 'none';  // スムーズな移動のためにトランジションを無効化
        } else if (e.target.closest('.content')) {
            // コンテンツ領域での操作時、条件を満たせばドラッグを開始
            if (!dragInitiated && canInitiateDrag(deltaY)) {
                isDragging = true;
                dragInitiated = true;
                e.preventDefault();
            }
        }
        
        lastTouchY = currentY;  // 次の移動量計算のために現在位置を保存
    }

    /**
     * タッチ/マウス操作終了時の処理
     * ボトムシートの最終位置を決定し、状態をリセット
     * 
     * @param {Event} e - タッチ/マウスイベント
     */
    function dragStop(e) {
        isActiveScroll = false;  // スクロール操作終了
        scrollStartPosition = null;

        if (!isDragging) return;

        const bottomSheetTop = bottomSheet.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // ドラッグ位置に応じてボトムシートの最終位置を決定
        if (bottomSheetTop <= windowHeight * 0.3) {
            moveBottomSheet(-90, 100);  // 上部に展開（画面の30%以下の位置）
        } else if (bottomSheetTop >= windowHeight * 0.75) {
            closeAction();
            moveBottomSheet(100, 100);  // 下部に収納（画面の75%以上の位置）
        }

        // 状態のリセット
        isDragging = false;
        dragInitiated = false;
        bottomSheet.style.transition = '0.1s ease-out';  // トランジションを再有効化
    }

    /**
     * スワイプ開始時の処理
     * スワイプによるボトムシート閉じる操作の開始を制御
     * 
     * @param {Event} e - タッチ/マウスイベント
     */
    function handleSwipeStart(e) {

        if (isModalOpen()) return; // モーダル表示中、スワイプ禁止

        // 操作開始条件のチェック
        if (!isOpened || isDragging || isActiveScroll) return;
        
        // content領域でのタッチは無視（スクロール操作を優先）
        if (e.target.closest('.content')) return;
        
        swipeStartY = e.touches ? e.touches[0].clientY : e.clientY;
    }

    /**
     * スワイプ移動時の処理
     * スワイプによるボトムシート閉じる操作の制御
     * 
     * @param {Event} e - タッチ/マウスイベント
     */
    function handleSwipeMove(e) {

        if (isModalOpen()) return; // モーダル中、スワイプ禁止

        // 操作継続条件のチェック
        if (!isOpened || isDragging || isActiveScroll || swipeStartY === null) return;
        
        // content領域でのタッチは無視（スクロール操作を優先）
        if (e.target.closest('.content')) return;

        const currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - swipeStartY;

        // 下スワイプの場合のみ処理
        if (deltaY > 0) {
            e.preventDefault();
            isSwipeClosing = true;
            const newTop = parseInt(getComputedStyle(bottomSheet).top) + deltaY;
            bottomSheet.style.top = `${newTop}px`;
            bottomSheet.style.transition = 'none';
        }
    }

    /**
     * スワイプ終了時の処理
     * スワイプによるボトムシート閉じる操作の完了を制御
     * 
     * @param {Event} e - タッチ/マウスイベント
     */
    function handleSwipeEnd(e) {

        if (isModalOpen()) return; //モーダル中、スワイプ禁止

        // 操作終了条件のチェック
        if (!isOpened || isDragging || swipeStartY === null) return;

        if (isSwipeClosing) {
            const bottomSheetTop = bottomSheet.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            // スワイプ位置に応じてボトムシートを閉じるか元に戻すか決定
            if (bottomSheetTop >= windowHeight * 0.3) {
                closeAction();
                moveBottomSheet(100, 100);  // 下部に収納
            } else {
                moveBottomSheet(-90, 100);  // 元の位置に戻す
            }
        }

        // 状態のリセット
        swipeStartY = null;
        isSwipeClosing = false;
        bottomSheet.style.transition = '0.1s ease-out';
    }

    /**
     * ボトムシートを指定位置に移動する関数
     * 
     * @param {number} distance - 移動距離（vh単位）
     * @param {number} position - 最終位置（vh単位）
     */
    function moveBottomSheet(distance, position) {
        bottomSheet.style.transform = `translateY(${distance}vh)`;  // transformによる移動
        bottomSheet.style.top = `${position}vh`;  // 位置の設定
        bottomSheet.style.transition = '0.1s ease-out';  // スムーズな移動のためのトランジション
    }

    /**
     * ボトムシートを開く時の付随処理
     * 背景のスクロールを無効化し、マスクを表示する
     */
    function openAction() {
        isOpened = true;
        document.body.style.overflow = 'hidden';  // 背景スクロールを無効化
        mask.style.display = 'block';  // マスクを表示
    }

    /**
     * ボトムシートを閉じる時の付随処理
     * 背景のスクロールを有効化し、マスクを非表示にする
     */
    function closeAction() {
        isOpened = false;
        document.body.style.overflow = 'auto';  // 背景スクロールを有効化
        mask.style.display = 'none';  // マスクを非表示
    }

    /**
     * 画面のズームをリセットする関数
     * モバイルデバイスでのピンチズームを元の状態に戻す
     */
    function resetZoom() {
        // 現在のズームレベルを取得
        const currentZoom = window.visualViewport ? window.visualViewport.scale : 1;
        
        // ズームが1.0でない場合のみリセットを実行
        if (currentZoom !== 1.0) {
            // ズームをリセットするためのメタタグを一時的に追加
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(meta);

            // 少し待ってからメタタグを削除（ズームリセットを確実にするため）
            setTimeout(() => {
                document.head.removeChild(meta);
                // ズーム制限を解除
                const newMeta = document.createElement('meta');
                newMeta.name = 'viewport';
                newMeta.content = 'width=device-width, initial-scale=1.0';
                document.head.appendChild(newMeta);
            }, 100);
        }
    }

    /**
     * ボトムシートを開く
     * - 既に開いている場合は処理をスキップ
     * - 画面のズームをリセット
     * - ボトムシートを適切な位置に移動
     * - 背景スクロールを無効化し、マスクを表示
     */
    window.openBottomSheet = () => {
        if (isOpened) return;  // 既に開いている場合は何もしない
        resetZoom();  // 画面のズームをリセット
        moveBottomSheet(-75, 100);  // ボトムシートを上部に移動（-60vh）
        openAction();  // マスク表示などの付随処理
    };

    /**
     * ボトムシートを閉じる
     * - マスクを非表示にして背景スクロールを有効化
     * - ボトムシートを画面外に移動
     */
    window.closeBottomSheet = () => {
        closeAction();  // マスク非表示などの付随処理
        moveBottomSheet(100, 100);  // ボトムシートを下部に移動（100vh）
    };

    /**
     * ボトムシートの内容を更新する
     * - `infoNumber`, `infoName`, `infoTag`, `infoContent` のテキストを指定された値に変更
     *
     * @param {Object} title - 情報のタイトルオブジェクト（number, textプロパティを持つ）
     * @param {string} content - 更新するHTMLコンテンツ
     */
    window.updateBottomSheetContent = (title, content) => {
        const infoNumber = document.querySelector('.bottom-sheet .info-number');
        const infoName = document.querySelector('.bottom-sheet .info-name');
        const infoTag = document.querySelector('.bottom-sheet .info-tag');
        const infoContent = document.querySelector('.bottom-sheet .info-content');
        
        if (infoNumber) infoNumber.textContent = title.number;  // 情報番号を更新
        if (infoName) infoName.textContent = title.text;  // 情報タイトルを更新
        if (infoTag) infoTag.textContent = title.tag;  // 情報タグを更新
        if (infoContent) infoContent.innerHTML = content;  // 情報の本文を更新
    };

    // =========================================
    // イベントリスナーの設定
    // =========================================

    /**
     * ボトムシートを閉じるイベント
     * マスクまたは閉じるボタンをクリックしたときにボトムシートを閉じる
     */
    document.addEventListener('click', (e) => {
        if (e.target === mask || e.target === closeButton) {
            closeAction();  // マスク非表示などの付随処理
            moveBottomSheet(100, 100);  // ボトムシートを下部に移動（100vh）
        }
    });
    
    // ドラッグ操作のイベントリスナー（タッチとマウス両対応）
    bottomSheet.addEventListener('touchstart', dragStart, { passive: false });
    bottomSheet.addEventListener('mousedown', dragStart);
    document.addEventListener('touchmove', dragging, { passive: false });
    document.addEventListener('mousemove', dragging);
    document.addEventListener('touchend', dragStop);
    document.addEventListener('mouseup', dragStop);

    // スワイプによる閉じる機能のイベントリスナー
    document.addEventListener('touchstart', handleSwipeStart, { passive: false });
    document.addEventListener('mousedown', handleSwipeStart);
    document.addEventListener('touchmove', handleSwipeMove, { passive: false });
    document.addEventListener('mousemove', handleSwipeMove);
    document.addEventListener('touchend', handleSwipeEnd);
    document.addEventListener('mouseup', handleSwipeEnd);
    
});
