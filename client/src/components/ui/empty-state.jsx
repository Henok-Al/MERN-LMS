import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EmptyState({ title, description, buttonText, href, icon: Icon }) {
  const navigate = useNavigate();

  return (
    <div className="border-2 border-dashed rounded-xl p-12 text-center max-w-lg mx-auto">
      {Icon && <Icon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6">{description}</p>
      )}
      {buttonText && href && (
        <Button onClick={() => navigate(href)}>
          {buttonText}
        </Button>
      )}
    </div>
  );
}