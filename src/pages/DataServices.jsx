import ServiceLanding from '../components/ServiceLanding';
import { dataTrack } from '../data/tracks';

export default function DataServices() {
  return <ServiceLanding track={dataTrack} />;
}
