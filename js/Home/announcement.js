// =============================================================
// TAB 1: HOME - OWNER ANNOUNCEMENT SYSTEM
// =============================================================
function renderAnnouncement() {
  const ann = getStored('announcement', null);
  let content = '';
  let author = 'Miles (Chủ sáng lập)';
  let dateStr = 'Hôm nay';

  if (typeof ann === 'string' && ann.trim()) {
    content = ann.trim();
  } else if (ann && typeof ann === 'object') {
    content = ann.content || ann.value || '';
    if (ann.author) author = ann.author;
    if (ann.date) dateStr = ann.date;
  }

  if (!content) {
    content = '✨ Chúc các kỹ thuật viên một ngày làm việc tràn đầy năng lượng!';
  }

  const ktvContent = document.getElementById('home-announcement-content');
  const ktvAuthor = document.getElementById('home-announcement-author');
  const ktvDate = document.getElementById('home-announcement-date');

  if (ktvContent) ktvContent.innerText = content;
  if (ktvAuthor) ktvAuthor.innerText = author;
  if (ktvDate) ktvDate.innerText = dateStr;

  const admContent = document.getElementById('admin-announcement-content');
  const admDate = document.getElementById('admin-announcement-date');
  if (admContent) admContent.innerText = content;
  if (admDate) admDate.innerText = dateStr;
}

function openEditAnnouncementModal() {
  const ann = getStored('announcement', '');
  const curText = typeof ann === 'string' ? ann : (ann?.content || '');
  const inputEl = document.getElementById('input-announcement-content');
  if (inputEl) inputEl.value = curText;
  const modal = document.getElementById('modal-edit-announcement');
  if (modal) modal.classList.remove('hidden');
}

function closeEditAnnouncementModal() {
  const modal = document.getElementById('modal-edit-announcement');
  if (modal) modal.classList.add('hidden');
}

function handleSaveAnnouncement(e) {
  e.preventDefault();
  const content = document.getElementById('input-announcement-content')?.value.trim() || '';
  if (!content) return;

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const ann = {
    content: content,
    author: currentUser?.full_name || 'Miles (Chủ sáng lập)',
    date: dateStr
  };

  setStored('announcement', ann);
  renderAnnouncement();
  closeEditAnnouncementModal();

  if (typeof fbSaveAnnouncement === 'function') {
    fbSaveAnnouncement(content);
  }

  callGasApi('update_announcement', {
    content: content,
    text: content,
    announcement: content,
    value: content,
    author: ann.author
  });

  alert('✅ Đã cập nhật thông báo thành công! Mọi thiết bị sẽ tự động nhảy thông báo mới trong 0.03s.');
}
