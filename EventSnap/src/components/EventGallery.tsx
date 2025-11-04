import { useEffect, useState } from "react";
import { ArrowLeft, Download, Camera } from "lucide-react";
import JSZip from "jszip";

interface Photo {
  id: string;
  url: string;
  uploadedAt: number;
}

interface EventGalleryProps {
  onBack: () => void;
  onTakePhoto: () => void;
  eventId: string;
  eventName: string;
  apiUrl: string;
  publicAnonKey: string;
  remainingPhotos: number;
}

export function EventGallery({
  onBack,
  onTakePhoto,
  eventId,
  eventName,
  apiUrl,
  publicAnonKey,
  remainingPhotos,
}: EventGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPhotos();
  }, [eventId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${apiUrl}/events/${eventId}/photos`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error || "Fehler beim Laden der Fotos",
        );
      }

      const data = await response.json();
      setPhotos(data.photos);
    } catch (err: any) {
      console.error("Load photos error:", err);
      setError(err.message || "Fehler beim Laden der Fotos");
    } finally {
      setLoading(false);
    }
  };

  const downloadAllPhotos = async () => {
    if (photos.length === 0) return;

    setDownloading(true);

    try {
      const zip = new JSZip();

      // Download all photos and add to zip
      await Promise.all(
        photos.map(async (photo, index) => {
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            zip.file(`photo-${index + 1}.jpg`, blob);
          } catch (err) {
            console.error("Error downloading photo:", err);
          }
        }),
      );

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download zip
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${eventName.replace(/\s+/g, "-")}-photos.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download error:", err);
      setError("Fehler beim Herunterladen");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-purple-900/20 to-blue-900/20" />

      <div className="sticky top-0 backdrop-blur-xl bg-black/40 border-b border-white/10 p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft size={24} />
          </button>

          <h2 className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            {eventName}
          </h2>

          <button
            onClick={downloadAllPhotos}
            disabled={photos.length === 0 || downloading}
            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all disabled:opacity-50"
          >
            <Download size={24} />
          </button>
        </div>

        <p className="text-center text-white/60 text-sm">
          {photos.length}{" "}
          {photos.length === 1 ? "Foto" : "Fotos"}
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6">
            <p className="text-white">Lade Fotos...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="text-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={loadPhotos}
              className="backdrop-blur-xl bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white px-6 py-3 rounded-2xl"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="text-center">
            <p className="text-white/60 mb-4">
              Noch keine Fotos
            </p>
            {remainingPhotos > 0 && (
              <button
                onClick={onTakePhoto}
                className="backdrop-blur-xl bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white px-6 py-3 rounded-2xl flex items-center gap-2 mx-auto hover:scale-105 active:scale-95 transition-transform"
              >
                <Camera size={20} />
                <span>Foto aufnehmen</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="grid grid-cols-2 gap-3 p-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-[4/3] backdrop-blur-xl bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-xl"
              >
                <img
                  src={photo.url}
                  alt="Event photo"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && remainingPhotos > 0 && (
        <div className="sticky bottom-0 backdrop-blur-xl bg-black/40 border-t border-white/10 p-4 z-10">
          <button
            onClick={onTakePhoto}
            className="w-full backdrop-blur-xl bg-gradient-to-br from-blue-500/80 to-purple-500/80 text-white p-4 rounded-2xl shadow-xl hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            <span>
              Foto aufnehmen ({remainingPhotos} verbleibend)
            </span>
          </button>
        </div>
      )}
    </div>
  );
}