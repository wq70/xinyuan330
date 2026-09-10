(function loadDocumentFragments() {
  const fragmentScripts = window.__EPHONE_HTML_FRAGMENT_SCRIPTS;
  const htmlParts = [];
  window.__EPHONE_HTML_PARTS = htmlParts;

  const showFailure = error => {
    console.error('[DocumentLoader] 页面片段加载失败:', error);
    const loader = document.getElementById('bootstrap-loader');
    if (loader) loader.remove();
    document.body.innerHTML = '';
    const message = document.createElement('main');
    message.style.cssText = 'max-width:560px;margin:15vh auto;padding:24px;font-family:sans-serif;line-height:1.6;';
    const title = document.createElement('h1');
    title.textContent = '页面加载失败';
    const detail = document.createElement('p');
    detail.textContent = '无法读取页面片段，请确认项目文件完整后刷新。';
    message.append(title, detail);
    document.body.appendChild(message);
  };

  if (!Array.isArray(fragmentScripts) || fragmentScripts.length === 0) {
    showFailure(new Error('HTML fragment script manifest is missing.'));
    return;
  }

  // 并行加载所有 fragment 脚本：把每个 <script> 一次性追加到 head，
  // 浏览器会并发请求；最后一个 onload 触发后整体完成。
  // 总耗时 ≈ 最慢那个片段的下载时间，而不是所有片段耗时之和。
  let remaining = fragmentScripts.length;
  let hasFailure = false;

  const onFragmentFinished = error => {
    if (hasFailure) return;
    if (error) {
      hasFailure = true;
      showFailure(error);
      return;
    }
    remaining -= 1;
    if (remaining === 0) {
      finishLoading();
    }
  };

  const finishLoading = () => {
    const loader = document.getElementById('bootstrap-loader');
    if (loader) loader.remove();
    delete window.__EPHONE_HTML_FRAGMENT_SCRIPTS;
    delete window.__EPHONE_HTML_PARTS;
    // 使用 document.write 一次性写入完整文档。
    // 这里必须在初始解析阶段调用（document-loader 是同步 <script> 加载的），
    // 这样浏览器会按初始解析模式重新解析，所有内联 <script defer> 仍能正常延迟执行。
    document.open('text/html', 'replace');
    document.write(htmlParts.join(''));
    document.close();
  };

  fragmentScripts.forEach(fragmentPath => {
    const script = document.createElement('script');
    script.src = fragmentPath;
    script.onload = () => {
      script.remove();
      onFragmentFinished();
    };
    script.onerror = () => onFragmentFinished(new Error(`Unable to load ${fragmentPath}`));
    document.head.appendChild(script);
  });
})();
