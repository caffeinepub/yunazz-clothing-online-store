import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

const STORAGE_KEY = "yunazz_reviews";

export function getReviews(): Review[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getProductReviews(productId: string): Review[] {
  return getReviews().filter((r) => r.productId === productId);
}

export function getAverageRating(productId: string): {
  avg: number;
  count: number;
} {
  const reviews = getProductReviews(productId);
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { avg, count: reviews.length };
}

export function StarRating({
  rating,
  size = 14,
}: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? "text-amber-400"
              : "text-muted-foreground/30"
          }
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

export default function ReviewDialog({
  open,
  onClose,
  productId,
  productName,
}: {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    const existing = getReviews();
    const review: Review = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      productId,
      productName,
      customerName: name.trim(),
      rating,
      comment: comment.trim(),
      createdAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, review]));
    toast.success("Review submitted! Thank you.");
    setName("");
    setRating(5);
    setComment("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm" data-ocid="review.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            Write a Review
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{productName}</p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Your Name</Label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-ocid="review.name.input"
            />
          </div>
          <div className="space-y-1">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="p-0.5 transition-transform hover:scale-110"
                  data-ocid={`review.star.${star}`}
                >
                  <Star
                    size={28}
                    className={
                      star <= (hovered || rating)
                        ? "text-amber-400"
                        : "text-muted-foreground/30"
                    }
                    fill={star <= (hovered || rating) ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Your Review</Label>
            <Textarea
              placeholder="Tell us what you think about this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              data-ocid="review.comment.textarea"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="review.cancel.button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-primary hover:bg-primary/90"
              data-ocid="review.submit.button"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
