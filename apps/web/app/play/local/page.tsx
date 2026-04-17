import { MatchPlayground } from '../components/match-playground';

export default function LocalPlayPage() {
    return <MatchPlayground mode="local" seed={20260416} aiEnabled={false} />;
}
