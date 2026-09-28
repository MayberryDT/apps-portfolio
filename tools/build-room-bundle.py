"""Rebuild public/room-bundle.css exactly as released: the room's stylesheets joined by newlines.
index.html and room.html both load this bundle. Run after editing any of the files below."""
from pathlib import Path
P = Path(__file__).resolve().parents[1] / 'public'
FILES = ['vendor/basecoat/basecoat.min.css', 'style.css', 'workstation.css', 'tab-motion.css', 'studio-ui.css', 'contact-landing.css',
         'photo-frames.css', 'photo-gallery.css', 'shelf-gallery.css', 'return-navigation.css', 'journal.css', 'mobile.css']
(P / 'room-bundle.css').write_text('\n'.join((P / f).read_text(encoding='utf-8') for f in FILES), encoding='utf-8')
print('room-bundle.css rebuilt from', len(FILES), 'files')
