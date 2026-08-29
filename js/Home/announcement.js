// =============================================================
// TAB 1: HOME - OWNER ANNOUNCEMENT SYSTEM
// =============================================================
function renderAnnouncement() {
  const ann = getStored('announcement', DEFAULT_ANNOUNCEMENT);
  
  const ktvContent = document.getElementById('home-announcement-content');
  const ktvAuthor = document.getElementById('home-announcement-author');
  const ktvDate = document.getElementById('home-announcement-date');

  if (ktvContent) ktvContent.innerText = ann.content || DEFAULT_ANNOUNCEMENT.content;
  if (ktvAuthor) ktvAuthor.innerText = ann.author || 'Miles (Chủ sáng lập)';
  if (ktvDate) ktvDate.innerText = ann.date || 'Hôm nay';

  const admContent = document.getElementById('admin-announcement-content');
  const admDate = document.getElementById('admin-announcement-date');
  if (admContent) admContent.innerText = ann.content || DEFAULT_ANNOUNCEMENT.content;
  if (admDate) admDate.innerText = ann.date || 'Hôm nay';
}

function openEditAnnouncementModal() {
  const ann = getStored('announcement', DEFAULT_ANNOUNCEMENT);
  document.getElementById('input-announcement-content').value = ann.content || '';
  document.getElementById('modal-edit-announcement').classList.remove('hidden');
}

function closeEditAnnouncementModal() {
  document.getElementById('modal-edit-announcement').classList.add('hidden');
}

function handleSaveAnnouncement(e) {
  e.preventDefault();
  const content = document.getElementById('input-announcement-content').value.trim();
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

  callGasApi('update_announcement', {
    content: content,
    author: ann.author
  });

  alert('✅ Đã cập nhật thông báo thành công!\nNội dung đã được lưu và gửi đồng bộ đến Google Sheets.');
}
