import { Card, CardMedia, CardContent, Typography, IconButton, Box } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";

interface ItemCardProps {
  item: any;
  isWishlisted?: boolean;
  onWishlistToggle?: (itemId: string, newStatus: boolean) => void;
}

export default function ItemCard({ item, isWishlisted = false, onWishlistToggle }: ItemCardProps) {
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const navigate = useNavigate();

  useEffect(() => {
    setWishlisted(isWishlisted);
  }, [isWishlisted]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      if (!wishlisted) {
        await axiosClient.post("/wishlist", { itemId: item._id });
        setWishlisted(true);
        if (onWishlistToggle) onWishlistToggle(item._id, true);
      } else {
        await axiosClient.delete(`/wishlist/${item._id}`);
        setWishlisted(false);
        if (onWishlistToggle) onWishlistToggle(item._id, false);
      }
    } catch (error: any) {
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Error toggling wishlist:", error);
      }
    }
  };

  return (
    <Card
      onClick={() => navigate(`/items/${item._id}`)}
      sx={{
        borderRadius: 3,
        boxShadow: 2,
        transition: "transform 200ms ease, box-shadow 200ms ease",
        cursor: "pointer",
        '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
      }}
    >
      <Box position="relative" sx={{ height: "350px", backgroundColor: "#fafafa" }}>
        <CardMedia
          component="img"
          image={item.images?.[0] || "https://via.placeholder.com/300x400"}
          alt={item.title}
          sx={{ 
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: item.available ? 1 : 0.6,
          }}
        />
        
        {/* Availability Badge */}
        {!item.available && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(244, 67, 54, 0.95)",
              color: "white",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "1.1rem",
              boxShadow: 3,
            }}
          >
            RENTED
          </Box>
        )}

        {/* Price badge */}
        <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
          <Box sx={{ backgroundColor: 'rgba(25,118,210,0.95)', color: 'white', px: 1.5, py: 0.5, borderRadius: 1, fontWeight: 700, fontSize: '0.9rem' }}>
            ${item.dailyPrice.toFixed(0)}/day
          </Box>
        </Box>

        {/* Wishlist Button */}
        <IconButton
          onClick={toggleWishlist}
          sx={{ 
            position: "absolute", 
            top: 8, 
            right: 8, 
            backgroundColor: "rgba(255,255,255,0.9)",
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.95)' }
          }}
        >
          {wishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
      </Box>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.primary" fontWeight={600}>
          ${item.dailyPrice.toFixed(2)} / day
        </Typography>
        {item.depositAmount && (
          <Typography variant="caption" color="text.secondary" display="block">
            Deposit: ${item.depositAmount.toFixed(2)}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" mt={1}>
          {item.genderTarget && `${item.genderTarget.charAt(0).toUpperCase() + item.genderTarget.slice(1)}`}
          {item.size && ` • Size ${item.size}`}
        </Typography>
      </CardContent>
    </Card>
  );
}
