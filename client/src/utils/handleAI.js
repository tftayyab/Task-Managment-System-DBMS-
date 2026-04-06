// utils/handleAI.js
import { enhanceTextWithAI } from './aiEnhancer';

export const animateTyping = (text, field, setNewTask) => {
  let i = 0;
  const textRef = { current: '' };

  setNewTask((prev) => ({ ...prev, [field]: '' }));

  const interval = setInterval(() => {
    textRef.current += text.charAt(i);
    i++;

    setNewTask((prev) => ({
      ...prev,
      [field]: textRef.current,
    }));

    if (i >= text.length) clearInterval(interval);
  }, 25);
};

export const handleEnhanceField = async ({
  field,
  newTask,
  setNewTask,
  setShowReload,
  setLoadingTitle,
  setLoadingDesc,
  setNotification,
}) => {
  const localKey = `original${field.charAt(0).toUpperCase() + field.slice(1)}`;

  if (!localStorage.getItem(localKey)) {
    localStorage.setItem(localKey, newTask[field]);
  }

  const original = localStorage.getItem(localKey);
  if (!original || original.length < 3) {
    if (setNotification) {
      setNotification(`Please enter at least 3 characters for ${field} before enhancing.`);
    }
    return;
  }

  if (field === 'title') setLoadingTitle(true);
  else setLoadingDesc(true);

  try {
    const result = await enhanceTextWithAI(
      field === 'title' ? original : '',
      field === 'description' ? original : ''
    );

    const improved = field === 'title' ? result?.enhancedTitle : result?.enhancedDescription;

    if (improved && typeof improved === 'string') {
      animateTyping(improved, field, setNewTask);
      setShowReload((prev) => ({ ...prev, [field]: true }));
      if (setNotification) {
        setNotification(`${field === 'title' ? 'Title' : 'Description'} enhanced with AI`);
      }
    } else if (setNotification) {
      setNotification(`AI could not improve the ${field}. Try again.`);
    }
  } catch (err) {
    console.error(err);
    if (setNotification) {
      setNotification(`AI enhancement failed for ${field}. Please try again.`);
    }
  } finally {
    if (field === 'title') setLoadingTitle(false);
    else setLoadingDesc(false);
  }
};

export const handleReload = (field, setNewTask) => {
  const original = localStorage.getItem(
    `original${field.charAt(0).toUpperCase() + field.slice(1)}`
  );
  if (original) {
    setNewTask((prev) => ({ ...prev, [field]: original }));
  }
};
