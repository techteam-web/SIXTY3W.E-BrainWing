import { AppStateProvider } from './app/AppState';
import { Stage } from './app/Stage';
import { ArchCurtain } from './components/ArchCurtain';
import { TopRail } from './components/TopRail';
import { FullscreenGate } from './components/FullscreenGate';
import { KeyboardNav } from './app/KeyboardNav';
import { RouteSync } from './app/RouteSync';
import { Preloader } from './app/Preloader';
import { StudioMark } from './components/StudioMark';

// #frozen-layer holds everything the fullscreen gate blurs. The gate is its sibling,
// never a descendant — see FullscreenGate.jsx.
export default function App() {
  return (
    <AppStateProvider>
      <div id="frozen-layer" className="absolute inset-0 overflow-hidden">
        <Stage />
        <TopRail />
        <ArchCurtain />
        <StudioMark />
      </div>
      <FullscreenGate />
      <KeyboardNav />
      <RouteSync />
      <Preloader />
    </AppStateProvider>
  );
}
