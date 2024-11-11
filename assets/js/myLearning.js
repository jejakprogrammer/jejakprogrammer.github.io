const apiKey = 'AIzaSyCLW9miHFxA3M9kZ2VuDn419_xEShpD28A';
const spreadsheetId = '1pfY3DWhSEdrG-3DgPXEyN131-1IOs2e9OTYMKkcn6wU';

async function fetchData(range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.values;
}

function convertYouTubeUrlToEmbed(url) {
    // Regex untuk menangkap ID video dan parameter lainnya seperti 'list' dan 'index'
    const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:&list=([a-zA-Z0-9_-]+))?(?:&index=(\d+))?/;
    const match = url.match(regex);

    // Jika ID video ditemukan
    if (match && match[1]) {
        let embedUrl = `https://www.youtube.com/embed/${match[1]}`;

        // Menambahkan parameter playlist jika ada
        if (match[2]) {
            embedUrl += `?list=${match[2]}`;
        }

        // Menambahkan parameter index jika ada dan playlist sudah ditambahkan
        if (match[3] && match[2]) {
            embedUrl += `&index=${match[3]}`;
        }

        return embedUrl;
    } else {
        console.error('Invalid YouTube URL:', url); // Log error to console
        return ''; // Mengembalikan string kosong jika URL tidak valid
    }
}

function copyToClipboard(event, text) {
    event.preventDefault(); // Mencegah halaman terreload
    navigator.clipboard.writeText(text).then(function() {
        showNotification(); // Menampilkan notifikasi
    }, function(err) {
        console.error('Gagal menyalin: ', err); // Notifikasi gagal
    });
}

function showNotification() {
    const notification = document.getElementById('notification');
    notification.style.display = 'block'; // Menampilkan notifikasi
    setTimeout(() => {
        notification.style.display = 'none'; // Menyembunyikan notifikasi setelah beberapa detik
    }, 2000); // Menampilkan notifikasi selama 2 detik
}

async function fetchMasterData(categoryName) {
    console.log("Fetching master data for category:", categoryName);
    const masterData = await fetchData('master!A:K'); // Ambil data dari kolom A hingga I di sheet "master"

    // Filter data berdasarkan kategori pada kolom E
    const filteredData = masterData.filter(row => row[4] === categoryName); // Kolom E berisi kategori
    console.log("Filtered data:", filteredData); // Log untuk melihat hasil filter

    return filteredData.map(row => ({
        id: row[0],
        contentText: row[1], // Ambil kolom B yang berisi konten
        subTitle: row[2],
        description: row[3], // Ambil deskripsi dari kolom D
        category: row[4], // Nama kategori
        linkYT: row[5], // Ambil link YouTube dari kolom F
        pdf_link: row[6], // Bahasa dari kolom E
        web_link: row[7], // Bahasa dari kolom E
        other_link: row[8], // Bahasa dari kolom E // Bahasa dari kolom E
        author: row[9], // Bahasa dari kolom E
        timeStamp: row[10]
    }));
}

async function updateCategoryText() {
    console.log("Updating category text...");
    const categoryData = await fetchData('category!A1:A'); // Ambil semua data dari kolom A sheet "category"
    const containerDesktop = document.getElementById('category_links_desktop');
    const containerMobile = document.getElementById('category_links_mobile');

    containerDesktop.innerHTML = "";
    containerMobile.innerHTML = "";

    for (const [index, row] of categoryData.entries()) {
        const categoryName = row[0];
        const masterContent = await fetchMasterData(categoryName);

        console.log(`Content for ${categoryName}:`, masterContent); // Log untuk memastikan konten

        const desktopLink = document.createElement('a');
        desktopLink.href = "#";
        desktopLink.className = "my-learning-link";
        desktopLink.onclick = () => toggleChildLinks(`desktop_category_links_${index}`);
        desktopLink.innerHTML = `<i class="fas fa-folder"></i> ${categoryName}`;

        const desktopChildLinks = document.createElement('div');
        desktopChildLinks.id = `desktop_category_links_${index}`;
        desktopChildLinks.className = "child-links";

        // Loop untuk menambahkan setiap link konten secara terpisah
        masterContent.forEach(item => {
            const contentLink = document.createElement('a');
            contentLink.href = "#"; // Set href to # to prevent default behavior
            contentLink.innerHTML = `<i class="fas fa-file-alt"></i> [${item.id}] ${item.contentText}`;

            // Attach click event for each content link
            contentLink.onclick = (event) => {
                event.preventDefault(); // Prevent the default action (navigation)
                loadContent('learning_content', item); // Pass the entire item instead of just specific fields
            };

            desktopChildLinks.appendChild(contentLink);
        });

        containerDesktop.appendChild(desktopLink);
        containerDesktop.appendChild(desktopChildLinks);

        const mobileLink = document.createElement('a');
        mobileLink.href = "#";
        mobileLink.onclick = () => toggleChildLinks(`mobile_category_links_${index}`);
        mobileLink.innerHTML = `<i class="fas fa-folder"></i> ${categoryName} <i class="fas fa-chevron-down ms-auto"></i>`;

        const mobileChildLinks = document.createElement('div');
        mobileChildLinks.id = `mobile_category_links_${index}`;
        mobileChildLinks.className = "child-links";

        masterContent.forEach(item => {
            const contentLink = document.createElement('a');
            contentLink.href = "#"; // Set href to # to prevent default behavior
            contentLink.innerHTML = `<i class="fas fa-file-alt"></i> [${item.id}] ${item.contentText}`;

            // Attach click event for each content link
            contentLink.onclick = (event) => {
                event.preventDefault(); // Prevent the default action (navigation)
                loadContent('learning_content', item); // Pass the entire item instead of just specific fields
            };

            mobileChildLinks.appendChild(contentLink);
        });

        containerMobile.appendChild(mobileLink);
        containerMobile.appendChild(mobileChildLinks);
    }
}

// Panggil ulang updateCategoryText secara periodik jika diperlukan
document.addEventListener("DOMContentLoaded", updateCategoryText);

function loadContent(content, item, title) {
    const contentArea = document.getElementById('content-area');
    if (content == "home") {
        contentArea.innerHTML = `
                    <h2>Welcome to the Dashboard</h2>
                    <p style="height:350px">This is the default content displayed when the page is first loaded.</p>
            `;
    } else if (content == "setting") {
        contentArea.innerHTML = `
                <h2>${title}</h2>
                <iframe src="https://${item}" width="100%" height="500px" frameborder="0" allowfullscreen></iframe>
            `;
    } else if (content == "learning_content") {
        let embedUrl;

        // Coba konversi URL YouTube, jika gagal tampilkan pesan error di console
        try {
            embedUrl = convertYouTubeUrlToEmbed(item.linkYT);
        } catch (error) {
            console.error("Invalid YouTube URL:", error);
        }

        // Fungsi untuk memeriksa ketersediaan URL PDF
        async function checkPDF(url) {
            if (!url || url === "-") {
                return false;
            }
            try {
                const response = await fetch(url, {
                    method: 'HEAD'
                });
                return response.ok;
            } catch (error) {
                console.error("PDF link not accessible:", error);
                return false;
            }
        }

        // Fungsi untuk memeriksa ketersediaan URL web link
        async function checkURL(url) {
            if (!url || url === "-") {
                return false;
            }
            try {
                const response = await fetch(url, {
                    method: 'HEAD'
                });
                return response.ok;
            } catch (error) {
                console.error("Web link not accessible:", error);
                return false;
            }
        }

        // Memanggil fungsi checkPDF dan checkURL, kemudian mengatur konten
        Promise.all([checkPDF(item.pdf_link), checkURL(item.web_link)]).then(([isPDFAvailable, isWebLinkAvailable]) => {
                    contentArea.innerHTML = `
            <h2>${item.contentText}</h2>
            <hr>
            <p>${item.subTitle || "No description available."}</p>
            ${embedUrl ? `<iframe src="${embedUrl}" width="100%" height="500px" frameborder="0" allowfullscreen></iframe>` : `<p>YouTube not available now.</p>`}
            ${isPDFAvailable ? 
                `<iframe src="${item.pdf_link}" width="100%" height="600px">Browser Anda tidak mendukung tampilan PDF.</iframe>` :
                `<p>PDF not available now.</p>`
            }
            ${isWebLinkAvailable ? 
                `<p><iframe src="${item.web_link}" width="100%" height="500px" frameborder="0" allowfullscreen></iframe></p>` : 
                `<p>Web not available now.</p>`
            }
            <div class="card">
                <div class="card-content">
                    <h2 class="card-title">${item.category || "No category available."}</h2>
                    <hr>
                    <p class="card-content"><strong>Description:</strong> ${item.description || "No description available."}</p>
                </div>
            </div>                        
            <div class="card">
                <div class="card-content">
                    <h2 class="card-title">Original Links</h2>
                    
                    <div class="table-responsive">
                        <table class="table">
                            <tr>
                                <th><i class="fab fa-youtube" style="font-size: 24px; color: #FF0000;"></i>YouTube</th>
                                <td style="max-width: 150px; overflow-x: auto; white-space: nowrap;">${item.linkYT || "No description available."}</td>
                                <td><a href="#" title="copy" class="btn btn-primary" onclick="copyToClipboard(event, '${item.linkYT}')"><i class="fas fa-copy"></i></a></td>
                            </tr>
                            <tr>
                                <th><i class="fas fa-file-pdf" style="font-size: 24px; color: #FF0000;"></i>PDF</th>
                                <td style="max-width: 150px; overflow-x: auto; white-space: nowrap;">${item.pdf_link || "No description available."}</td>
                                <td><a href="#" title="copy" class="btn btn-primary" onclick="copyToClipboard(event, '${item.pdf_link}')"><i class="fas fa-copy"></i></a></td>
                            </tr>
                            <tr>
                                <th><i class="fas fa-globe" style="font-size: 24px; color: #007BFF;"></i>Web</th>
                                <td style="max-width: 150px; overflow-x: auto; white-space: nowrap;">${item.web_link || "No description available."}</td>
                                <td><a href="#" title="copy" class="btn btn-primary" onclick="copyToClipboard(event, '${item.web_link}')"><i class="fas fa-copy"></i></a></td>
                            </tr>
                            <tr>
                                <th><i class="fas fa-globe" style="font-size: 24px; color: #007BFF;"></i>Other</th>
                                <td style="max-width: 150px; overflow-x: auto; white-space: nowrap;">${item.other_link || "No description available."}</td>
                                <td><a href="#" title="copy" class="btn btn-primary" onclick="copyToClipboard(event, '${item.other_link}')"><i class="fas fa-copy"></i></a></td>
                            </tr>
                        </table>
                    </div>

                    <div id="notification" style="display: none; background-color: #4CAF50; color: white; padding: 10px; border-radius: 5px; margin-top: 10px; position: relative;">Link was copied to clipboard!</div>

                    <div class="card-actions">
                        <p>Uploader: ${item.author || "No description available."}&nbsp;</p>
                        <p>Upload Time: ${item.timeStamp || "No category available."}</p>
                    </div>
                </div>
            </div>
        `;
    });
            }

            else {
                contentArea.innerHTML = `
                    <h2>Welcome to the Dashboard</h2>
                    <p style="height:350px">This is the default content displayed when the page is first loaded.</p>
            `;
            }

        }

        function toggleChildLinks(id) {
            const links = document.getElementById(id);
            links.style.display = (links.style.display === "none" || links.style.display === "") ? "block" : "none";
        }

    const sidebarHTML = `
        <div class="d-none d-lg-block">
        <!-- Desktop Sidebar -->
        <div class="sidebar">
            <h5 class="text-white text-center">MY LEARNING</h5>
            <a href="#" onclick="loadContent('home')"><i class="fas fa-home"></i> Home</a>
            <a class="stting-link" href="#" onclick="toggleChildLinks('setting_links')">
                <i class="fas fa-gear"></i> Setting
                <i class="fas fa-chevron-down ms-auto" style="padding-left: 20px;"></i>
                <!-- Chevron icon for dropdown -->
            </a>
            <div id="setting_links" class="child-links">
                <a href="#" onclick="loadContent('setting', 'docs.google.com/forms/d/e/1FAIpQLSd_skA3GHa2gSWx6SHld3tS4ex4igmTu_PMUrp0Y4J10yeIaw/viewform', 'Add New')"><i class="fas fa-plus"></i> Add New</a>
                <a href="#" onclick="loadContent('setting', 'docs.google.com/spreadsheets/d/1pfY3DWhSEdrG-3DgPXEyN131-1IOs2e9OTYMKkcn6wU/edit?gid=548550951#gid=548550951', 'Master Data')"><i class="fas fa-file-alt"></i> Master Data</a>
                <a href="#" onclick="loadContent('setting', 'docs.google.com/forms/d/1exoYDF4w7tnEoIZL-mmVzBqXtSB37LGUEVkptd9r7b0/edit', 'Setting Form')"><i class="fas fa-gear"></i> Setting Form</a>
            </div>
            <div id="category_links_desktop" class="scrollable-content"></div>
        </div>
    </div>

    <!-- Toggle Sidebar Button for Mobile -->
    <button class="btn btn-light m-3 d-lg-none form-control" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar" style="max-width: 90%;">
        <span style="float: left; padding-left: 10px;">JEJAK PROGRAMMER</span><i class="fas fa-bars" style="padding-right: 20px; padding-top: 5px; float: right;"></i>
    </button>

    <!-- Offcanvas Sidebar for Mobile -->
    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasSidebar" aria-labelledby="offcanvasSidebarLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasSidebarLabel">MY LEARNING</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <a href="#" onclick="loadContent('home')" data-bs-dismiss="offcanvas"><i class="fas fa-home"></i> Home</a>
            <a href="#" onclick="toggleChildLinks('offcanvas_setting_links')">
                <i class="fas fa-gear"></i> Setting
                <i class="fas fa-chevron-down ms-auto"></i>
            </a>
            <div id="offcanvas_setting_links" class="child-links">
                <a href="#" onclick="loadContent('setting', 'docs.google.com/forms/d/e/1FAIpQLSd_skA3GHa2gSWx6SHld3tS4ex4igmTu_PMUrp0Y4J10yeIaw/viewform', 'Add New')" data-bs-dismiss="offcanvas"><i class="fas fa-plus"></i> Add New</a>
                <a href="#" onclick="loadContent('setting', 'docs.google.com/spreadsheets/d/1pfY3DWhSEdrG-3DgPXEyN131-1IOs2e9OTYMKkcn6wU/edit?gid=548550951#gid=548550951', 'Master Data')" data-bs-dismiss="offcanvas"><i class="fas fa-file-alt"></i> Master Data</a>
                <a href="#" onclick="loadContent('setting', 'docs.google.com/forms/d/1exoYDF4w7tnEoIZL-mmVzBqXtSB37LGUEVkptd9r7b0/edit', 'Setting Form')" data-bs-dismiss="offcanvas"><i class="fas fa-gear"></i> Setting Form</a>
            </div>
            <!-- Container untuk links dinamis di Offcanvas Sidebar untuk Mobile -->
            <div id="category_links_mobile"></div>
        </div>
    </div>

    <!-- Content Area -->
    <div id="content-area" class="container mt-4">
        <h2>Welcome to the Dashboard</h2>
        <p style="height:350px">This is the default content displayed when the page is first loaded.</p>
    </div>
    <!-- Content Footer -->
   <div id="footer" class="footer-area">
        <p>&copy; 2024 <a href="https://jejakprogrammer.github.io/" target="_blank">JejakProgrammer</a> All rights reserved.</p>
    </div>
    `;

    // Menyuntikkan HTML ke elemen dengan id "root"
    document.getElementById('root').innerHTML = sidebarHTML;