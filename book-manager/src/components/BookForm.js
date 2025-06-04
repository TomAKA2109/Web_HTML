import React, { useState, useEffect } from 'react';

function BookForm({ onAdd, onUpdate, editingBook }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');

  // Khi editingBook thay đổi, nạp lại dữ liệu
  useEffect(() => {
    if (editingBook) {
      setTitle(editingBook.title);
      setAuthor(editingBook.author);
      setYear(editingBook.year);
    } else {
      setTitle('');
      setAuthor('');
      setYear('');
    }
  }, [editingBook]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !author || !year) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    if (editingBook) {
      onUpdate({
        ...editingBook,
        title,
        author,
        year: parseInt(year, 10),
      });
    } else {
      const newBook = {
        id: Date.now(),
        title,
        author,
        year: parseInt(year, 10),
      };
      onAdd(newBook);
    }

    // Reset form
    setTitle('');
    setAuthor('');
    setYear('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <h2>{editingBook ? 'Cập nhật sách' : 'Thêm Sách'}</h2>
      <div>
        <label>Tiêu đề: </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Tác giả: </label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Năm XB: </label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
      </div>
      <button type="submit">
        {editingBook ? 'Cập nhật' : 'Thêm'}
      </button>
    </form>
  );
}

export default BookForm;
