function sendToWhatsApp() {
    const form = document.getElementById('contactForm');
    const name = form.elements['name'].value;
    const subject = form.elements['Subject'].value;
    const email = form.elements['_replyto'].value;
    const message = form.elements['message'].value;

    const phoneNumber = "6285846761639"; // Ganti dengan nomor WhatsApp Anda
    const text = `Name: ${name}\nSubject: ${subject}\nEmail: ${email}\nMessage: ${message}`;
    const encodedText = encodeURIComponent(text);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedText}`;

    window.open(whatsappURL, '_blank');
}