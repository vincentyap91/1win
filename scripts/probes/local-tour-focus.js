const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Rules');
button?.focus();
return {focused: document.activeElement === button};
