import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient.ts";
import { TextField, Box, MenuItem, Button, Paper, Skeleton, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import ItemCard from "../components/ItemCard.tsx";

interface Item {
  _id: string;
  title: string;
  dailyPrice: number;
  size?: string;
  category?: string;
  images?: string[];
}

interface WishlistItemResponse {
  _id: string;
  item?: Item;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [genderTarget, setGenderTarget] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [wishlistItemIds, setWishlistItemIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("itemViewMode");
    return (saved === "grid" || saved === "list") ? saved : "grid";
  });

  const fetchWishlist = async () => {
    const hasAuthFlag = localStorage.getItem("dh_authed") === "1";
    const authValid = localStorage.getItem("dh_auth_valid") === "1";
    if (!hasAuthFlag || !authValid) {
      setWishlistItemIds(new Set());
      return;
    }
    try {
      const res = await axiosClient.get<WishlistItemResponse[]>("/wishlist");
      const itemIds = new Set<string>(
        res.data.map((wi) => wi.item?._id).filter((id): id is string => Boolean(id))
      );
      setWishlistItemIds(itemIds);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("dh_authed");
        localStorage.removeItem("dh_auth_valid");
      }
      // User not authenticated or error fetching wishlist
      setWishlistItemIds(new Set());
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/items", {
        params: { query, category, size, genderTarget },
      });
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchItems();
  };

  const handleWishlistToggle = (itemId: string, isWishlisted: boolean) => {
    setWishlistItemIds(prev => {
      const newSet = new Set(prev);
      if (isWishlisted) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newView: "grid" | "list" | null) => {
    if (newView !== null) {
      setViewMode(newView);
      localStorage.setItem("itemViewMode", newView);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography component="h1" variant="h4" sx={{ fontWeight: 600 }}>
          Browse Items
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="grid" aria-label="grid view">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box mb={3}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              label="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              inputProps={{ 'aria-label': 'Search items' }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="dress">Dress</MenuItem>
              <MenuItem value="suit">Suit</MenuItem>
              <MenuItem value="jacket">Jacket</MenuItem>
            </TextField>
            <TextField
              select
              label="Gender"
              value={genderTarget}
              onChange={(e) => setGenderTarget(e.target.value)}
              sx={{ minWidth: 140 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="unisex">Unisex</MenuItem>
            </TextField>
            <TextField
              label="Size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              sx={{ minWidth: 120 }}
            />
            <Button variant="contained" onClick={handleSearch} sx={{ height: 40 }}>
              Search
            </Button>
          </Box>
        </Paper>
      </Box>

      {viewMode === "grid" ? (
        <Grid container spacing={3}>
          {loading ? (
            // show skeletons while loading
            Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={`skeleton-${i}`}>
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Skeleton variant="rectangular" height={340} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" />
                  </Box>
                </Paper>
              </Grid>
            ))
          ) : items.length === 0 ? (
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
                <Box mb={2}>
                  <strong>No items found</strong>
                </Box>
                <Box mb={2}>Try adjusting your filters or search term.</Box>
                <Button variant="outlined" onClick={() => { setQuery(''); setCategory(''); setSize(''); setGenderTarget(''); fetchItems(); }}>
                  Clear filters
                </Button>
              </Paper>
            </Grid>
          ) : (
            items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <ItemCard 
                  item={item} 
                  isWishlisted={wishlistItemIds.has(item._id)}
                  onWishlistToggle={handleWishlistToggle}
                  variant="grid"
                />
              </Grid>
            ))
          )}
        </Grid>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {loading ? (
            // show skeletons while loading
            Array.from({ length: 6 }).map((_, i) => (
              <Paper key={`skeleton-${i}`} elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
                <Skeleton variant="rectangular" width={200} height={200} />
                <Box sx={{ p: 2, flex: 1 }}>
                  <Skeleton width="60%" height={32} />
                  <Skeleton width="40%" height={24} />
                  <Skeleton width="50%" height={20} />
                </Box>
              </Paper>
            ))
          ) : items.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
              <Box mb={2}>
                <strong>No items found</strong>
              </Box>
              <Box mb={2}>Try adjusting your filters or search term.</Box>
              <Button variant="outlined" onClick={() => { setQuery(''); setCategory(''); setSize(''); setGenderTarget(''); fetchItems(); }}>
                Clear filters
              </Button>
            </Paper>
          ) : (
            items.map((item) => (
              <ItemCard 
                key={item._id}
                item={item} 
                isWishlisted={wishlistItemIds.has(item._id)}
                onWishlistToggle={handleWishlistToggle}
                variant="list"
              />
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
