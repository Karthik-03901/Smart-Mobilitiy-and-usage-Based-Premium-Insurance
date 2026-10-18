import { LoadingScreen } from '../components/LoadingScreen';

export default function Loading() {
  return (
    <LoadingScreen
      message="Initializing DriveFair"
      subtext="Establishing encrypted connection to behavioral telematics network..."
    />
  );
}
