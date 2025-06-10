import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { marked } from "marked";
import { DashboardConfig, Visibility, Stage } from "../types/config";

interface ProductViewProps {
  config: DashboardConfig;
  productKey: string;
  viewMode: Visibility;
}

export const ProductView: React.FC<ProductViewProps> = ({
  config,
  productKey,
  viewMode,
}) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const product = config.products[productKey];

  // Get visible stages based on view mode
  const stages: [string, Stage][] = Object.entries(product.stages)
    .filter(
      ([_, stage]) => viewMode === "internal" || stage.visibility === "public"
    )
    .sort(([_, a], [__, b]) => a.order - b.order);

  useEffect(() => {
    const loadContent = async () => {
      if (!selectedStage) return;

      const stage = product.stages[selectedStage];
      try {
        const response = await fetch(`/products/${stage.file}`);
        const text = await response.text();
        setContent(marked.parse(text));
      } catch (error) {
        console.error("Failed to load content:", error);
        setContent("Error loading content");
      }
    };

    loadContent();
  }, [selectedStage, product.stages]);

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" gutterBottom>
        {product.name}
        {viewMode === "internal" && (
          <Chip
            label="Internal View"
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      <Tabs
        value={selectedStage}
        onChange={(_, newValue) => setSelectedStage(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {stages.map(([key, stage]) => (
          <Tab
            key={key}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {key.replace(/_/g, " ")}
                {stage.metadata?.priority === "high" && (
                  <Chip label="High Priority" color="error" size="small" />
                )}
              </Box>
            }
            value={key}
          />
        ))}
      </Tabs>

      {selectedStage && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <Typography>Select a stage to view content</Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProductView;
