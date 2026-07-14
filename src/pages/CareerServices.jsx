import ServiceLanding from '../components/ServiceLanding';
import { careerTrack } from '../data/tracks';

export default function CareerServices() {
  return <ServiceLanding track={careerTrack} />;
}
