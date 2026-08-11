import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import AddRestaurantPage from './pages/AddRestaurantPage';

type View = { kind: 'home' } | { kind: 'detail'; id: string } | { kind: 'add' };

function App() {
  const [view, setView] = useState<View>({ kind: 'home' });

  // Update document title based on view
  useEffect(() => {
    if (view.kind === 'home') {
      document.title = 'FlavorVault - Discover & Review the Best Restaurants Near You';
    } else if (view.kind === 'add') {
      document.title = 'Add Restaurant - FlavorVault';
    }
  }, [view.kind]);

  if (view.kind === 'detail') {
    return (
      <RestaurantDetailPage
        restaurantId={view.id}
        onBack={() => setView({ kind: 'home' })}
      />
    );
  }

  if (view.kind === 'add') {
    return (
      <AddRestaurantPage
        onBack={() => setView({ kind: 'home' })}
        onAdded={(id) => setView({ kind: 'detail', id })}
      />
    );
  }

  return (
    <HomePage
      onSelectRestaurant={(id) => setView({ kind: 'detail', id })}
      onAddRestaurant={() => setView({ kind: 'add' })}
    />
  );
}

export default App;
