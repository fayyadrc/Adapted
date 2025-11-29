import React, { useState } from "react";


export function CanvaResult() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [generatedImage, setGeneratedImage] = useState(null);
    const [file, setFile] = useState(null);

    async function handleGenerateAndAdd() {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            // 1. Call Backend to generate infographic and get URL
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch("http://127.0.0.1:5000/api/canva/generate-infographic", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to generate infographic");
            }

            const data = await response.json();
            const imageUrl = data.url;
            const imageData = data.image_data; // Base64 image for display

            console.log("Generated Image URL:", imageUrl);
            setGeneratedImage(imageData);

            // 2. Upload the image to Canva
            // The 'url' must be publicly accessible.
            // We wrap this in a try-catch because it will fail if not running inside Canva
            try {
                const { upload } = await import("@canva/asset");
                const { addElementAtPoint } = await import("@canva/design");

                const uploadResult = await upload({
                    type: "image",
                    mimeType: "image/jpeg",
                    url: imageUrl,
                    thumbnailUrl: imageUrl, // Using same URL for thumbnail for simplicity
                    aiDisclosure: "none",
                });

                console.log("Upload Result:", uploadResult);

                // 3. Add the image to the design
                await addElementAtPoint({
                    type: "image",
                    ref: uploadResult.ref,
                    altText: { text: "Generated Infographic", decorative: false },
                });
            } catch (canvaError) {
                console.warn("Canva SDK operations failed (likely not running inside Canva):", canvaError);
                // Don't block the UI, just log the warning. 
                // We still want to show the generated image.
            }

        } catch (err) {
            console.error("Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="p-4 border rounded shadow-sm bg-white">
            <h3 className="text-lg font-semibold mb-2">Canva Integration</h3>
            <p className="text-sm text-gray-600 mb-4">
                Upload a document (PDF/DOCX) to generate an infographic and add it to your Canva design.
            </p>

            <div className="mb-4">
                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm mb-2">
                    Error: {error}
                </div>
            )}

            {generatedImage && (
                <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Generated Preview:</p>
                    <img src={generatedImage} alt="Generated Infographic" className="max-w-full h-auto border rounded" />
                </div>
            )}

            <button
                onClick={handleGenerateAndAdd}
                disabled={loading || !file}
                className={`px-4 py-2 rounded text-white ${loading || !file ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {loading ? "Processing..." : "Generate & Add to Canva"}
            </button>
        </div>
    );
}
