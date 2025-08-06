import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CreatePopSectionProps {
  onCreateClick: () => void;
  onTemplateDesignClick: () => void;
}

export default function CreatePopSection({
  onCreateClick,
  onTemplateDesignClick,
}: CreatePopSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>新しいポップを作成</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          <Button onClick={onCreateClick} className='w-full' size='lg'>
            ＋ 新しいポップを作成
          </Button>
          <Button 
            onClick={onTemplateDesignClick} 
            variant='outline' 
            className='w-full' 
            size='lg'
          >
            🎨 テンプレートをデザイン
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
