/**
 * Media Components - Images, video, audio, figure/figcaption.
 */
export const mediaComponents = [
  {
    type: 'image',
    category: 'media',
    label: 'Image',
    icon: '#icon-image',
    defaultProps: {
      src: '',
      alt: 'Describe this image',
      width: '100%',
      height: 'auto',
      isDecorative: false
    },
    requiredA11y: ['alt-text'],
    render(props) {
      const figure = document.createElement('div');
      const img = document.createElement('img');
      img.src = props.src || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" fill="%23e0e0e0"><rect width="300" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="18">Image Placeholder</text></svg>');
      if (props.isDecorative) {
        img.alt = '';
        img.setAttribute('role', 'presentation');
      } else {
        img.alt = props.alt || '';
      }
      img.style.width = props.width || '100%';
      img.style.height = props.height || 'auto';
      img.style.maxWidth = '100%';
      img.style.display = 'block';
      figure.appendChild(img);
      return figure;
    },
    toHTML(props) {
      if (props.isDecorative) {
        return `<img src="${props.src || ''}" alt="" role="presentation">`;
      }
      return `<img src="${props.src || ''}" alt="${props.alt || ''}">`;
    }
  },
  {
    type: 'figure',
    category: 'media',
    label: 'Figure + Caption',
    icon: '#icon-figure',
    defaultProps: {
      src: '',
      alt: 'Describe this image',
      caption: 'Figure caption describing the image'
    },
    requiredA11y: ['alt-text', 'figcaption'],
    render(props) {
      const figure = document.createElement('figure');
      figure.style.margin = '16px 0';
      const img = document.createElement('img');
      img.src = props.src || 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" fill="%23e0e0e0"><rect width="300" height="200"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="18">Figure Image</text></svg>');
      img.alt = props.alt || '';
      img.style.width = '100%';
      img.style.maxWidth = '100%';
      img.style.display = 'block';
      const caption = document.createElement('figcaption');
      caption.textContent = props.caption || 'Caption';
      caption.style.marginTop = '8px';
      caption.style.fontSize = '14px';
      caption.style.color = '#595959';
      figure.appendChild(img);
      figure.appendChild(caption);
      return figure;
    },
    toHTML(props) {
      return `<figure>\n  <img src="${props.src || ''}" alt="${props.alt || ''}">\n  <figcaption>${props.caption || ''}</figcaption>\n</figure>`;
    }
  },
  {
    type: 'video',
    category: 'media',
    label: 'Video',
    icon: '#icon-video',
    defaultProps: { src: '', title: 'Video title', captions: true },
    render(props) {
      const wrapper = document.createElement('div');
      wrapper.style.background = '#1a1a1a';
      wrapper.style.color = '#fff';
      wrapper.style.padding = '40px';
      wrapper.style.textAlign = 'center';
      wrapper.style.borderRadius = '4px';
      wrapper.innerHTML = `<span aria-hidden="true" style="font-size: 48px;">&#9654;</span><p>${props.title || 'Video'}</p>`;
      return wrapper;
    },
    toHTML(props) {
      const track = props.captions ? '\n  <track kind="captions" src="captions.vtt" srclang="en" label="English">' : '';
      return `<video controls aria-label="${props.title || 'Video'}">\n  <source src="${props.src || ''}" type="video/mp4">${track}\n  Your browser does not support the video element.\n</video>`;
    }
  },
  {
    type: 'audio',
    category: 'media',
    label: 'Audio',
    icon: '#icon-audio',
    defaultProps: { src: '', title: 'Audio title', transcript: true },
    render(props) {
      const wrapper = document.createElement('div');
      wrapper.style.background = '#f5f5f5';
      wrapper.style.padding = '16px';
      wrapper.style.borderRadius = '4px';
      wrapper.style.border = '1px solid #ddd';
      wrapper.innerHTML = `<span aria-hidden="true" style="font-size: 24px;">&#9835;</span> <strong>${props.title || 'Audio'}</strong>`;
      return wrapper;
    },
    toHTML(props) {
      let html = `<audio controls aria-label="${props.title || 'Audio'}">\n  <source src="${props.src || ''}" type="audio/mpeg">\n  Your browser does not support the audio element.\n</audio>`;
      if (props.transcript) {
        html += `\n<details>\n  <summary>Transcript</summary>\n  <p>Transcript content goes here.</p>\n</details>`;
      }
      return html;
    }
  }
];
