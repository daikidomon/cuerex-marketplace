const state = {
  catalog: null,
  lang: localStorage.getItem("cuerex-marketplace-lang") || "ja",
  query: "",
  category: "all",
  license: "all",
  status: "all",
  tag: "all",
  sort: "featured",
  selectedId: "",
};

const i18n = {
  ja: {
    heroEyebrow: "Official pack directory",
    heroTitle: "cuerex に追加できる編集パックを探す。",
    heroBody: "Marketplaceは準備中です。公開後、無料パックはURLで追加でき、有料パックはクラウド適用で保護します。",
    launchTitle: "Coming soon",
    launchBody: "現在は公開前のプレビューです。パックのダウンロードとインストールURLのコピーは無効にしています。",
    packsLabel: "packs",
    templatesLabel: "templates",
    freeLabel: "free",
    searchLabel: "検索",
    categoryLabel: "カテゴリ",
    licenseLabel: "ライセンス",
    statusLabel: "状態",
    sortLabel: "並び替え",
    sortFeatured: "おすすめ順",
    sortNewest: "新しい順",
    sortPopular: "利用数順",
    sortName: "名前順",
    catalogEyebrow: "Pack catalog",
    all: "すべて",
    free: "無料",
    paid: "有料",
    available: "公開中",
    comingSoon: "準備中",
    download: "ダウンロード",
    copyPackUrl: "Pack URLをコピー",
    copyInstallUrl: "Install URLをコピー",
    copied: "コピーしました",
    comingSoonAction: "Coming soon",
    installTitle: "cuerexでの追加",
    installBody: "cuerexの「辞書/テンプレート」→「編集テンプレート」→「URLから追加」にこのURLを貼り付けます。",
    cloudBody: "このパックは将来クラウド側で適用します。テンプレート本文は配布されません。",
    highlightsLabel: "内容",
    detailsLabel: "詳細",
    detailPlaceholder: "パックを選択すると詳細と導入URLが表示されます。",
    empty: "該当するパックがありません。",
    langToggle: "English",
    count: (n) => `${n}件のパック`,
    templateCount: (n) => `${n} templates`,
  },
  en: {
    heroEyebrow: "Official pack directory",
    heroTitle: "Find editing packs that can be added to cuerex.",
    heroBody: "Marketplace is preparing for launch. Free packs will install by URL, and paid packs will use protected cloud application.",
    launchTitle: "Coming soon",
    launchBody: "This is a pre-launch preview. Pack downloads and install URL copying are disabled.",
    packsLabel: "packs",
    templatesLabel: "templates",
    freeLabel: "free",
    searchLabel: "Search",
    categoryLabel: "Category",
    licenseLabel: "License",
    statusLabel: "Status",
    sortLabel: "Sort",
    sortFeatured: "Featured",
    sortNewest: "Newest",
    sortPopular: "Most used",
    sortName: "Name",
    catalogEyebrow: "Pack catalog",
    all: "All",
    free: "Free",
    paid: "Paid",
    available: "Available",
    comingSoon: "Coming soon",
    download: "Download",
    copyPackUrl: "Copy Pack URL",
    copyInstallUrl: "Copy Install URL",
    copied: "Copied",
    comingSoonAction: "Coming soon",
    installTitle: "Install in cuerex",
    installBody: "Paste this URL into Dictionary/Templates -> Editing Templates -> Add from URL in cuerex.",
    cloudBody: "This pack will be applied in the cloud later. The template prompt body will not be distributed.",
    highlightsLabel: "Highlights",
    detailsLabel: "Details",
    detailPlaceholder: "Select a pack to see details and install URLs.",
    empty: "No packs match the current filters.",
    langToggle: "日本語",
    count: (n) => `${n} packs`,
    templateCount: (n) => `${n} templates`,
  },
};

const $ = (selector, root = document) => root.querySelector(selector);

function t(key, ...args) {
  const value = i18n[state.lang][key] ?? i18n.ja[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function localized(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  return value[state.lang] || value.ja || value.en || "";
}

function absoluteUrl(path) {
  return new URL(path, window.location.href).href;
}

function installUrl(item) {
  if (!item.packUrl) return "";
  return `cuerex://install?templatePack=${encodeURIComponent(absoluteUrl(item.packUrl))}`;
}

function formatNumber(value) {
  return new Intl.NumberFormat(state.lang === "ja" ? "ja-JP" : "en-US").format(Number(value || 0));
}

function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-option]").forEach((node) => {
    node.textContent = t(node.dataset.i18nOption);
  });
  $("[data-lang-toggle]").textContent = t("langToggle");
  $("[data-empty]").textContent = t("empty");
}

function items() {
  return state.catalog?.templates || [];
}

function marketplaceComingSoon() {
  return state.catalog?.status === "comingSoon";
}

function selectedItem() {
  return items().find((item) => item.id === state.selectedId) || filteredItems()[0] || null;
}

function labelsFor(key) {
  const values = new Set(items().map((item) => item[key]).filter(Boolean));
  return ["all", ...Array.from(values).sort()];
}

function allTags() {
  const tags = new Set();
  items().forEach((item) => (item.tags || []).forEach((tag) => tags.add(tag)));
  return ["all", ...Array.from(tags).sort()];
}

function renderSegmented(targetSelector, values, stateKey, labeler = (value) => value) {
  const target = $(targetSelector);
  target.replaceChildren();
  values.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `segment${state[stateKey] === value ? " active" : ""}`;
    button.textContent = labeler(value);
    button.addEventListener("click", () => {
      state[stateKey] = value;
      render();
    });
    target.append(button);
  });
}

function renderTags() {
  const target = $("[data-tags]");
  target.replaceChildren();
  allTags().forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tag-button${state.tag === tag ? " active" : ""}`;
    button.textContent = tag === "all" ? t("all") : tag;
    button.addEventListener("click", () => {
      state.tag = tag;
      render();
    });
    target.append(button);
  });
}

function showToast(message) {
  const toast = $("[data-toast]");
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.hidden = true;
  }, 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const input = document.createElement("input");
    input.value = text;
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  showToast(t("copied"));
}

function matches(item) {
  const query = state.query.trim().toLowerCase();
  const haystack = [
    localized(item.name),
    localized(item.description),
    item.id,
    item.type,
    item.category,
    item.license,
    item.status,
    item.publisher,
    ...(item.tags || []),
    ...(localized(item.highlights) || []),
  ]
    .join(" ")
    .toLowerCase();
  return (
    (!query || haystack.includes(query)) &&
    (state.category === "all" || item.category === state.category) &&
    (state.license === "all" || item.license === state.license) &&
    (state.status === "all" || item.status === state.status) &&
    (state.tag === "all" || (item.tags || []).includes(state.tag))
  );
}

function filteredItems() {
  const list = items().filter(matches);
  return list.sort((a, b) => {
    if (state.sort === "newest") return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    if (state.sort === "popular") return Number(b.installs || 0) - Number(a.installs || 0);
    if (state.sort === "name") return localized(a.name).localeCompare(localized(b.name));
    const statusScore = (item) => (item.status === "available" ? 1 : 0);
    return statusScore(b) - statusScore(a) || Number(b.installs || 0) - Number(a.installs || 0);
  });
}

function statusLabel(item) {
  return marketplaceComingSoon() || item.status === "comingSoon" ? t("comingSoon") : t("available");
}

function renderCard(item) {
  const template = $("#pack-card-template");
  const node = template.content.firstElementChild.cloneNode(true);
  const hit = $(".card-hit", node);
  const preview = $(".preview", node);
  const isSelected = item.id === state.selectedId;

  node.classList.toggle("selected", isSelected);
  preview.src = item.previewUrl;
  preview.alt = localized(item.previewAlt) || localized(item.name);
  $(".type", node).textContent = `${item.category || "pack"} / ${statusLabel(item)}`;
  $("h3", node).textContent = localized(item.name);
  $(".price", node).textContent = item.priceLabel || t("free");
  $(".description", node).textContent = localized(item.description);

  const meta = $(".card-meta", node);
  meta.replaceChildren(
    metaChip(t("templateCount", item.templateCount || 0)),
    metaChip(`${formatNumber(item.installs)} installs`),
  );

  const tags = $(".card-tags", node);
  tags.replaceChildren(...(item.tags || []).map(metaChip));

  hit.addEventListener("click", () => {
    state.selectedId = item.id;
    render();
  });
  return node;
}

function metaChip(text) {
  const label = document.createElement("span");
  label.textContent = text;
  return label;
}

function actionButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function actionLink(label, href, className) {
  const link = document.createElement("a");
  link.className = className;
  link.textContent = label;
  link.href = href;
  link.download = "";
  return link;
}

function renderDetail(item) {
  const panel = $("[data-detail-panel]");
  if (!item) {
    panel.innerHTML = `<div class="detail-placeholder"><span class="brand-mark">cx</span><p>${t("detailPlaceholder")}</p></div>`;
    return;
  }

  const template = $("#detail-template");
  const node = template.content.firstElementChild.cloneNode(true);
  const preview = $(".detail-preview", node);
  const actions = $(".detail-actions", node);
  const installBox = $(".install-box", node);

  preview.src = item.previewUrl;
  preview.alt = localized(item.previewAlt) || localized(item.name);
  $(".type", node).textContent = `${item.type || "pack"} / ${statusLabel(item)}`;
  $("h2", node).textContent = localized(item.name);
  $(".description", node).textContent = localized(item.description);

  actions.replaceChildren();
  if (!marketplaceComingSoon() && item.status === "available" && item.packUrl) {
    actions.append(
      actionLink(t("download"), item.packUrl, "button primary"),
      actionButton(t("copyPackUrl"), "button", () => copyText(absoluteUrl(item.packUrl))),
      actionButton(t("copyInstallUrl"), "button", () => copyText(installUrl(item))),
    );
    installBox.innerHTML = `<strong>${t("installTitle")}</strong><p>${t("installBody")}</p><code>${absoluteUrl(item.packUrl)}</code>`;
  } else {
    actions.append(actionButton(t("comingSoonAction"), "button disabled", () => {}));
    installBox.innerHTML = `<strong>${t("launchTitle")}</strong><p>${marketplaceComingSoon() ? t("launchBody") : t("cloudBody")}</p>`;
  }

  const highlights = $(".highlights", node);
  highlights.replaceChildren(...(localized(item.highlights) || []).map((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    return li;
  }));

  const details = $(".detail-list", node);
  const detailRows = [
    ["Publisher", item.publisher || "cuerex"],
    ["Version", item.version || "1.0.0"],
    ["Updated", item.updatedAt || "-"],
    ["License", item.license || "free"],
    ["Compatible", item.compatibleWith?.cuerex || "-"],
  ];
  details.replaceChildren(...detailRows.flatMap(([key, value]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = key;
    dd.textContent = value;
    return [dt, dd];
  }));

  panel.replaceChildren(node);
}

function renderStats() {
  const list = items();
  $("[data-stat-packs]").textContent = formatNumber(list.length);
  $("[data-stat-templates]").textContent = formatNumber(
    list.reduce((sum, item) => sum + Number(item.templateCount || 0), 0),
  );
  $("[data-stat-free]").textContent = formatNumber(list.filter((item) => item.license === "free").length);
}

function render() {
  if (!state.catalog) return;
  applyLanguage();
  renderStats();
  renderSegmented("[data-categories]", labelsFor("category"), "category", (value) => value === "all" ? t("all") : value);
  renderSegmented("[data-licenses]", labelsFor("license"), "license", (value) => value === "all" ? t("all") : t(value));
  renderSegmented("[data-statuses]", labelsFor("status"), "status", (value) => value === "all" ? t("all") : t(value));
  renderTags();

  const list = filteredItems();
  if (!list.some((item) => item.id === state.selectedId)) {
    state.selectedId = list[0]?.id || "";
  }

  $("[data-count-label]").textContent = t("count", list.length);
  $("[data-pack-grid]").replaceChildren(...list.map(renderCard));
  $("[data-empty]").hidden = list.length > 0;
  renderDetail(selectedItem());
}

async function boot() {
  applyLanguage();
  const response = await fetch("./catalog.json", { cache: "no-store" });
  state.catalog = await response.json();
  state.selectedId = items()[0]?.id || "";

  $("[data-search]").addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });
  $("[data-sort]").addEventListener("change", (event) => {
    state.sort = event.target.value;
    render();
  });
  $("[data-lang-toggle]").addEventListener("click", () => {
    state.lang = state.lang === "ja" ? "en" : "ja";
    localStorage.setItem("cuerex-marketplace-lang", state.lang);
    render();
  });
  render();
}

boot().catch((error) => {
  $("[data-pack-grid]").textContent = `Failed to load catalog: ${error.message}`;
});
