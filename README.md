# VAM-AI Random Wheel Generator 🎡

A beautiful, fully-featured **random wheel picker** built for the VAM-AI community. Spin to select a winner from your list, manage entries and results, and enjoy a live photo carousel of past VAM-AI events.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🎡 **Interactive Spin Wheel** | Canvas-based wheel with smooth eased animation and colourful segments |
| 🖼️ **VAM-AI Logo Centre** | Click the logo in the centre of the wheel to spin |
| ⌨️ **Keyboard Shortcut** | Press `Space` to spin at any time |
| ➕ **Add Names** | Type and press Enter, or use the `+` button |
| 📋 **Bulk Import** | Paste a list of names (one per line) to import all at once |
| ✏️ **Inline Edit** | Click any name in the list to edit it in-place |
| 🗑️ **Remove Entry** | Delete individual entries with the ✕ button |
| 🔀 **Shuffle** | Randomise the order of all entries |
| 🔤 **Sort A–Z / Z–A** | Toggle alphabetical sort |
| 🧹 **Clear All** | Remove all entries at once (with confirmation) |
| 🏆 **Winner Modal** | Animated winner announcement with confetti burst |
| ➡️ **Results Tab** | Removed winners move to a ranked results list automatically |
| 🖼️ **Event Carousel** | Auto-scrolling carousel of VAM-AI event photos with lightbox |
| 📱 **Responsive** | Works on desktop and mobile |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ installed

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the app

```bash
python app.py
```

### 3. Open in your browser

```
http://127.0.0.1:5000
```

---

## 📁 Project Structure

```
VAM-random-wheel/
├── app.py                 # Flask server (entry point)
├── requirements.txt       # Python dependencies
├── .gitignore
├── README.md
├── vam-ai-logo.png        # VAM-AI brand logo (wheel centre)
├── events/                # Event photos shown in carousel
│   ├── ai-meetup-nov14-1.jpg.png
│   └── ...
├── templates/
│   └── index.html         # Main page template
└── static/
    ├── style.css          # Global styles
    └── wheel.js           # Wheel engine & app logic
```

---

## 🎮 How to Use

1. **Add names** — Type in the input box and press `Enter`, or paste a list in the **Bulk import** section.
2. **Spin** — Click the VAM-AI logo in the wheel centre, or press `Space`.
3. **Winner** — A full-screen winner announcement pops up with confetti 🎉.
4. **Remove & track** — Click **"Remove & add to results"** to move the winner out of the wheel and into the **Results** tab.
5. **Results** — Switch to the **Results** tab to see all winners in order.
6. **Manage** — Use **Shuffle**, **Sort**, or **Clear** to manage your entry list.

---

## 🖼️ Adding More Event Photos

Drop any `.png`, `.jpg`, `.jpeg`, `.webp`, or `.gif` file into the `events/` folder — the carousel picks them up automatically on the next page load.

---

## 🛠️ Tech Stack

- **Backend**: Python 3 + Flask (minimal — only serves files and the event-image API)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (Canvas API)
- **No build step required**

---

## 📄 License

Internal VAM-AI project. All rights reserved.
