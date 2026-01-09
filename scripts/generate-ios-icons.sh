#!/bin/bash
# iOS App Icon Generator
# Generates all required iOS app icon sizes from a 1024x1024 source

SOURCE="public/app-icon-1024.png"
OUTPUT_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Check if ImageMagick or sips is available
if command -v sips &> /dev/null; then
    echo "Using sips (macOS native)..."
    
    # iOS App Icon sizes
    declare -a sizes=(
        "20:20"
        "29:29"
        "40:40"
        "58:58"
        "60:60"
        "76:76"
        "80:80"
        "87:87"
        "120:120"
        "152:152"
        "167:167"
        "180:180"
        "1024:1024"
    )
    
    for size in "${sizes[@]}"; do
        IFS=':' read -r width height <<< "$size"
        output_file="$OUTPUT_DIR/AppIcon-${width}x${height}.png"
        echo "Generating ${width}x${height}..."
        sips -z "$height" "$width" "$SOURCE" --out "$output_file" > /dev/null 2>&1
    done
    
    echo "✅ All icons generated in $OUTPUT_DIR"
    
elif command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    
    convert "$SOURCE" -resize 20x20 "$OUTPUT_DIR/AppIcon-20x20.png"
    convert "$SOURCE" -resize 29x29 "$OUTPUT_DIR/AppIcon-29x29.png"
    convert "$SOURCE" -resize 40x40 "$OUTPUT_DIR/AppIcon-40x40.png"
    convert "$SOURCE" -resize 58x58 "$OUTPUT_DIR/AppIcon-58x58.png"
    convert "$SOURCE" -resize 60x60 "$OUTPUT_DIR/AppIcon-60x60.png"
    convert "$SOURCE" -resize 76x76 "$OUTPUT_DIR/AppIcon-76x76.png"
    convert "$SOURCE" -resize 80x80 "$OUTPUT_DIR/AppIcon-80x80.png"
    convert "$SOURCE" -resize 87x87 "$OUTPUT_DIR/AppIcon-87x87.png"
    convert "$SOURCE" -resize 120x120 "$OUTPUT_DIR/AppIcon-120x120.png"
    convert "$SOURCE" -resize 152x152 "$OUTPUT_DIR/AppIcon-152x152.png"
    convert "$SOURCE" -resize 167x167 "$OUTPUT_DIR/AppIcon-167x167.png"
    convert "$SOURCE" -resize 180x180 "$OUTPUT_DIR/AppIcon-180x180.png"
    convert "$SOURCE" -resize 1024x1024 "$OUTPUT_DIR/AppIcon-1024x1024.png"
    
    echo "✅ All icons generated in $OUTPUT_DIR"
else
    echo "❌ Neither sips nor ImageMagick found. Please install ImageMagick:"
    echo "   brew install imagemagick"
    exit 1
fi

# Generate the Contents.json file for Xcode
cat > "$OUTPUT_DIR/Contents.json" << 'EOF'
{
  "images" : [
    {
      "filename" : "AppIcon-20x20.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-60x60.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-58x58.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-87x87.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-80x80.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-120x120.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-120x120.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "AppIcon-180x180.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "AppIcon-40x40.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-40x40.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "AppIcon-29x29.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-58x58.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "AppIcon-40x40.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-80x80.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "AppIcon-76x76.png",
      "idiom" : "ipad",
      "scale" : "1x",
      "size" : "76x76"
    },
    {
      "filename" : "AppIcon-152x152.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "76x76"
    },
    {
      "filename" : "AppIcon-167x167.png",
      "idiom" : "ipad",
      "scale" : "2x",
      "size" : "83.5x83.5"
    },
    {
      "filename" : "AppIcon-1024x1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "✅ Contents.json created"
echo ""
echo "Next steps:"
echo "1. Run: npx cap open ios"
echo "2. In Xcode, verify icons appear in Assets.xcassets > AppIcon"
