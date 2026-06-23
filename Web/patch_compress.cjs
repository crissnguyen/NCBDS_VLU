const fs = require('fs');

const path = 'src/components/DashboardShared.jsx';
let content = fs.readFileSync(path, 'utf8');

const compressFunc = `
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', 0.7);
        };
        img.onerror = error => reject(error);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {`;

content = content.replace('  const handleSubmit = async (e) => {', compressFunc);

const appendImages = `
      const compressedImages = await Promise.all(images.map(img => compressImage(img)));
      compressedImages.forEach(img => fd.append('images', img));`;

content = content.replace("images.forEach(img => fd.append('images', img));", appendImages);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched DashboardShared.jsx');
