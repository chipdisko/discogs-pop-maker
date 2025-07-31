import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CreatePopSectionProps {
  onCreateClick: () => void;
}

export default function CreatePopSection({
  onCreateClick,
}: CreatePopSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>新しいポップを作成</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onCreateClick} className='w-full' size='lg'>
          ＋ 新しいポップを作成
        </Button>
      </CardContent>
    </Card>
  );
}
