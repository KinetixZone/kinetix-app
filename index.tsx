
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#050507">
    <title>Kinetix Elite | Obsidian OS</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Outfit', sans-serif;
            background-color: #050507;
            color: white;
            margin: 0;
            overflow-x: hidden;
            -webkit-tap-highlight-color: transparent;
        }
        #root { min-height: 100vh; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }

        @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(1000%); }
        }
        .scanline-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100px;
            background: linear-gradient(to bottom, transparent, rgba(255, 0, 0, 0.05), transparent);
            animation: scanline 8s linear infinite;
            pointer-events: none;
        }
    </style>
    <script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@19.0.0",
    "react-dom": "https://esm.sh/react-dom@19.0.0",
    "react-dom/": "https://esm.sh/react-dom@19.0.0/",
    "react/": "https://esm.sh/react@19.0.0/",
    "@google/genai": "https://esm.sh/@google/genai@1.39.0",
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.45.0",
    "vite": "https://esm.sh/vite@^7.3.1",
    "@vitejs/plugin-react": "https://esm.sh/@vitejs/plugin-react@^5.1.3"
  }
}
</script>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./index.tsx"></script>
</body>
</html>
