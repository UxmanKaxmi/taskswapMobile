export function useGreeting(name?: string) {
  const hour = new Date().getHours();

  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';
  else greeting = 'Good Evening';

  return {
    greetingText: name ? `${greeting}, ${name}` : greeting,
    headline: 'Here’s what needs your attention',
  };
}
