# ONYX | The Art of Cinema

> **Your Private Cloud Media Center**

ONYX is a premium, aesthetically driven media streaming application designed to provide a cinema-quality personal cloud experience. Built with modern web technologies, it integrates seamlessly with services like **Real Debrid**, **Trakt**, and **TMDB** to deliver high-quality streaming content in a beautiful, responsive interface.

## 🎨 Branding & Aesthetics

ONYX follows a strict "Cinema Luxury" design language:

-   **Primary Colors**:
    -   **Gold**: `hsl(47 63% 52%)` (Accents, Borders, Highlights)
    -   **Deep Black**: `hsl(0 0% 2%)` (Backgrounds)
-   **Typography**:
    -   **Headings**: *Playfair Display* (Serif, Elegant)
    -   **Body**: *Inter* (Sans-serif, Clean)
-   **Visual Effects**:
    -   **Glassmorphism**: `util-glass-panel` for semi-transparent overlays.
    -   **Cinema Grain**: A subtle noise overlay (`util-cinema-grain`) to mimic film texture.
    -   **Text Glow**: Soft gold glow on key text elements.

## 🛠️ Technology Stack

### Core Frameworks
-   **[Next.js 16](https://nextjs.org/)**: App Router architecture for server-side rendering and routing.
-   **[React 19](https://react.dev/)**: Latest React features for UI components.
-   **[TypeScript](https://www.typescriptlang.org/)**: Strict type safety.

### Styling & UI
-   **[Tailwind CSS v4](https://tailwindcss.com/)**: Utility-first CSS framework.
-   **[Framer Motion](https://www.framer.com/motion/)**: Complex animations and transitions.
-   **[Lucide React](https://lucide.dev/)**: Consistent, beautiful iconography.

### Media & Playback
-   **[Artplayer](https://artplayer.org/)**: Advanced custom video player.
-   **[HLS.js](https://github.com/video-dev/hls.js/)**: Streaming protocol support.
-   **VLC Integration**: Custom protocol handler support for launching external VLC player.

### Data & Integrations
-   **[TMDB API](https://www.themoviedb.org/)**: Metadata for movies, TV shows, and people.
-   **[Trakt API](https://trakt.tv/)**: Watch history, watchlist, and collection syncing.
-   **[Real Debrid](https://real-debrid.com/)**: High-speed unrestricted downloading/streaming.
-   **[NextAuth.js](https://next-auth.js.org/)**: Authentication handling.

## 📂 Project Structure

```bash
c:/Projects/cloud-stream-web/
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── cloud/          # Cloud file management
│   │   ├── library/        # User library/collection
│   │   ├── movie/          # Movie details & player
│   │   ├── tv/             # TV show details & player
│   │   ├── person/         # Cast/Crew profiles
│   │   ├── setup/          # Initial setup wizard
│   │   └── actions/        # Server actions (Trakt, DB calls)
│   ├── components/
│   │   ├── features/       # Complex domain-specific components (Player, Auth)
│   │   └── ui/             # Reusable UI atoms (Buttons, Cards, Navbar)
│   └── lib/                # Utilities, API clients, helpers
├── public/                 # Static assets
└── ...
```

## 🚀 Getting Started

### Prerequisites
-   Node.js 20+
-   npm or pnpm
-   Keys for TMDB, Trakt, and Real Debrid

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd cloud-stream-web
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory. You can copy the example:
    ```bash
    cp .env.production.example .env.local
    ```
    
    **Required Variables**:
    ```env
    NEXT_PUBLIC_APP_URL=http://localhost:3000
    
    # API Keys
    TMDB_API_KEY=your_tmdb_key
    REAL_DEBRID_API_KEY=your_rd_key
    TRAKT_CLIENT_ID=your_trakt_id
    TRAKT_CLIENT_SECRET=your_trakt_secret
    
    # Auth
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=generate_a_random_string
    ```

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 🔧 Deployment

The project includes a `Dockerfile` for containerized deployment.

```bash
docker-compose up -d --build
```

Ensure environment variables are passed correctly in your `docker-compose.yml` or CI/CD pipeline.

## 🧩 Scripts

-   `npm run dev`: Start dev server.
-   `npm run build`: Build for production.
-   `npm run start`: Start production server.
-   `setup.sh`: Shell script for initial environment setup (Linux/Mac).
-   `vlc-fix.reg` & `vlc-launcher.bat`: Windows registry fix and batch script for enabling "Open in VLC" functionality.

## 📝 License

[Private / Proprietary]
