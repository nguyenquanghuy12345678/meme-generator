const canvas = document.getElementById('meme-canvas');
const ctx = canvas.getContext('2d');
let currentTemplate = null;
let textLayers = [];
let stickers = [];
let selectedLayer = null;
let dragOffset = { x: 0, y: 0 };
const captionSuggestions = {
  drake: ['No: [something bad]', 'Yes: [something good]'],
  distracted: ['Ignoring: [something boring]', 'Looking at: [something exciting]']
};

function initCanvas() {
  canvas.width = 500;
  canvas.height = 500;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function loadTemplate(src) {
  currentTemplate = new Image();
  currentTemplate.src = src;
  currentTemplate.onload = () => {
    canvas.width = currentTemplate.width;
    canvas.height = currentTemplate.height;
    redrawCanvas();
  };
}

function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (currentTemplate) {
    ctx.drawImage(currentTemplate, 0, 0);
  }
  textLayers.forEach(layer => {
    ctx.font = `${layer.size}px ${layer.font}`;
    ctx.fillStyle = layer.color;
    ctx.strokeStyle = layer.stroke;
    ctx.lineWidth = 2;
    if (layer.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    } else {
      ctx.shadowBlur = 0;
    }
    ctx.strokeText(layer.text, layer.x, layer.y);
    ctx.fillText(layer.text, layer.x, layer.y);
  });
  stickers.forEach(sticker => {
    ctx.drawImage(sticker.image, sticker.x, sticker.y, sticker.width, sticker.height);
  });
}

function addTextLayer() {
  const text = document.getElementById('text-input').value || 'New Text';
  const font = document.getElementById('font-select').value;
  const size = parseInt(document.getElementById('font-size').value);
  const color = document.getElementById('text-color').value;
  const stroke = document.getElementById('stroke-color').value;
  const shadow = document.getElementById('shadow-toggle').checked;
  const layer = { id: Date.now(), text, font, size, color, stroke, shadow, x: 50, y: 50 };
  textLayers.push(layer);
  updateTextLayersUI();
  redrawCanvas();
}

function updateTextLayersUI() {
  const layersDiv = document.getElementById('text-layers');
  layersDiv.innerHTML = '';
  textLayers.forEach(layer => {
    const div = document.createElement('div');
    div.className = 'text-box';
    div.innerText = layer.text;
    div.style.left = `${layer.x}px`;
    div.style.top = `${layer.y}px`;
    div.draggable = true;
    div.dataset.id = layer.id;
    div.addEventListener('dragstart', (e) => {
      selectedLayer = layer;
      dragOffset.x = e.offsetX;
      dragOffset.y = e.offsetY;
    });
    document.getElementById('text-boxes').appendChild(div);
  });
}

function addSticker(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    stickers.push({ id: Date.now(), image: img, x: 50, y: 50, width: 50, height: 50 });
    redrawCanvas();
  };
}

document.querySelectorAll('.template').forEach(img => {
  img.addEventListener('click', () => loadTemplate(img.src));
});

document.getElementById('custom-template').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    loadTemplate(URL.createObjectURL(file));
  }
});

document.getElementById('add-text').addEventListener('click', addTextLayer);

document.querySelectorAll('.sticker').forEach(img => {
  img.addEventListener('click', () => addSticker(img.src));
});

canvas.addEventListener('dragover', (e) => e.preventDefault());
canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  if (selectedLayer) {
    const rect = canvas.getBoundingClientRect();
    selectedLayer.x = e.clientX - rect.left - dragOffset.x;
    selectedLayer.y = e.clientY - rect.top - dragOffset.y;
    updateTextLayersUI();
    redrawCanvas();
  }
});

document.getElementById('text-input').addEventListener('input', () => {
  if (selectedLayer) {
    selectedLayer.text = document.getElementById('text-input').value;
    redrawCanvas();
  }
});

document.getElementById('font-select').addEventListener('change', () => {
  if (selectedLayer) {
    selectedLayer.font = document.getElementById('font-select').value;
    redrawCanvas();
  }
});

document.getElementById('font-size').addEventListener('input', () => {
  if (selectedLayer) {
    selectedLayer.size = parseInt(document.getElementById('font-size').value);
    redrawCanvas();
  }
});

document.getElementById('text-color').addEventListener('input', () => {
  if (selectedLayer) {
    selectedLayer.color = document.getElementById('text-color').value;
    redrawCanvas();
  }
});

document.getElementById('stroke-color').addEventListener('input', () => {
  if (selectedLayer) {
    selectedLayer.stroke = document.getElementById('stroke-color').value;
    redrawCanvas();
  }
});

document.getElementById('shadow-toggle').addEventListener('change', () => {
  if (selectedLayer) {
    selectedLayer.shadow = document.getElementById('shadow-toggle').checked;
    redrawCanvas();
  }
});

document.getElementById('download-meme').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'meme.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

document.getElementById('share-imgur').addEventListener('click', () => {
  const dataUrl = canvas.toDataURL('image/png');
  $.post('/api/share', { image: dataUrl }, (response) => {
    alert(`Meme shared! Link: ${response.link}`);
    addToGallery(response.link);
  });
});

document.getElementById('suggest-caption').addEventListener('click', () => {
  const templateId = document.querySelector('.template.active')?.dataset.id;
  if (templateId && captionSuggestions[templateId]) {
    document.getElementById('text-input').value = captionSuggestions[templateId][Math.floor(Math.random() * captionSuggestions[templateId].length)];
  }
});

function addToGallery(link) {
  const gallery = document.getElementById('meme-gallery');
  const card = document.createElement('div');
  card.className = 'meme-card';
  card.innerHTML = `
    <img src="${link}" alt="Meme">
    <button onclick="likeMeme(${link})">Like</button>
    <button onclick="remixMeme('${link}')">Remix</button>
  `;
  gallery.appendChild(card);
}

function likeMeme(link) {
  $.post('/api/memes/like', { link }, (response) => {
    alert('Meme liked!');
  });
}

function remixMeme(link) {
  loadTemplate(link);
}

function loadGallery() {
  $.get('/api/memes', (memes) => {
    memes.forEach(meme => addToGallery(meme.link));
  });
}

initCanvas();
loadGallery();