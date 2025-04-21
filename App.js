import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Button,
} from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

const albums = [
  {
    id: 'telugu001',
    title: 'Songs of Zion - Telugu',
    cover: 'https://i.imgur.com/8fKQ6iK.jpg',
    songs: [
      {
        id: 1,
        title: 'Mahima Nireekshana',
        artist: 'Hebron Telugu Worship',
        url: { uri: '/Mahima_Nireekshana.mp3' },
        image: 'https://i.imgur.com/8fKQ6iK.jpg',
        meaning: 'This song expresses longing and anticipation for the glory of God in trying times.',
        verse: 'Isaiah 60:1 – "Arise, shine, for your light has come, and the glory of the Lord rises upon you."',
      },
      {
        id: 2,
        title: 'Adbuta Deevenalu',
        artist: 'Hebron Telugu Choir',
        url: { uri: '/Adbuta_Deevenalu.mp3' },
        image: 'https://i.imgur.com/Xw1i5qO.jpeg',
        meaning: 'A joyful declaration of the miraculous blessings God bestows on His people.',
        verse: 'Ephesians 1:3 – "Praise be to the God... who has blessed us in the heavenly realms with every spiritual blessing in Christ."',
      },
    ],
  },
  {
    id: 'english001',
    title: 'Worship Collection - English',
    cover: 'https://i.imgur.com/4oRYi8z.jpg',
    songs: [
      {
        id: 3,
        title: 'Great Are You Lord',
        artist: 'Hebron Worship Band',
        url: { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
        image: 'https://i.imgur.com/R8QHHzd.jpg',
        meaning: 'A declaration of God’s greatness and breath-giving power over all creation.',
        verse: 'Psalm 145:3 – "Great is the Lord and most worthy of praise; His greatness no one can fathom."',
      },
    ],
  },
];

export default function App() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [sound, setSound] = useState(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
    }
  };

  const playSound = async (song) => {
    if (sound) await sound.unloadAsync();

    const { sound: newSound } = await Audio.Sound.createAsync(
      song.url,
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );
    setSound(newSound);
    setCurrentSong(song);
  };

  const togglePlayPause = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      status.isPlaying ? await sound.pauseAsync() : await sound.playAsync();
    }
  };

  const seekTo = async (value) => {
    if (sound && duration) await sound.setPositionAsync(value);
  };

  const playNext = () => {
    const list = selectedAlbum.songs;
    const index = list.findIndex((s) => s.id === currentSong.id);
    const nextSong = list[(index + 1) % list.length];
    playSound(nextSong);
  };

  const playPrevious = () => {
    const list = selectedAlbum.songs;
    const index = list.findIndex((s) => s.id === currentSong.id);
    const prevSong = list[(index - 1 + list.length) % list.length];
    playSound(prevSong);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎵 Hebron Music Albums</Text>

      {!selectedAlbum ? (
        <ScrollView contentContainerStyle={styles.albumGrid}>
          {albums.map((album) => (
            <TouchableOpacity
              key={album.id}
              style={styles.albumCard}
              onPress={() => setSelectedAlbum(album)}
            >
              <Image source={{ uri: album.cover }} style={styles.albumCover} />
              <Text style={styles.albumTitle}>{album.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <>
          <TouchableOpacity onPress={() => setSelectedAlbum(null)}>
            <Text style={styles.back}>← Back to Albums</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.grid}>
            {selectedAlbum.songs.map((song) => (
              <TouchableOpacity key={song.id} style={styles.card} onPress={() => playSound(song)}>
                <Image source={{ uri: song.image }} style={styles.cover} />
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.artist}>{song.artist}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {currentSong && (
        <View style={styles.playerBar}>
          <Image source={{ uri: currentSong.image }} style={styles.playerCover} />
          <View style={{ flex: 1, paddingHorizontal: 8 }}>
            <Text style={styles.playerTitle}>{currentSong.title}</Text>
            <Text style={styles.playerArtist}>{currentSong.artist}</Text>
            <Text style={styles.meaning}>💡 {currentSong.meaning}</Text>
            <Text style={styles.verse}>📖 {currentSong.verse}</Text>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={seekTo}
              minimumTrackTintColor="#00ffcc"
              maximumTrackTintColor="#444"
              thumbTintColor="#0ff"
            />
          </View>
          <Button title="⏮️" onPress={playPrevious} />
          <Button title="⏯️" onPress={togglePlayPause} />
          <Button title="⏭️" onPress={playNext} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 50, paddingBottom: 90, paddingHorizontal: 16 },
  header: { color: '#0ff', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  albumGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  albumCard: { width: '48%', marginBottom: 20 },
  albumCover: { width: '100%', height: 140, borderRadius: 10 },
  albumTitle: { color: '#fff', textAlign: 'center', marginTop: 8, fontWeight: 'bold' },
  back: { color: '#0ff', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#111', borderRadius: 10, padding: 10, marginBottom: 20, alignItems: 'center' },
  cover: { width: '100%', height: 140, borderRadius: 8, marginBottom: 10 },
  songTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  artist: { color: '#aaa', fontSize: 14, textAlign: 'center' },
  playerBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#111', padding: 10, borderTopColor: '#333', borderTopWidth: 1, flexDirection: 'row', alignItems: 'center' },
  playerCover: { width: 50, height: 50, borderRadius: 4 },
  playerTitle: { color: '#fff', fontWeight: 'bold' },
  playerArtist: { color: '#aaa', fontSize: 12 },
  meaning: { color: '#ccc', fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  verse: { color: '#0ff', fontSize: 12, marginTop: 2 },
  slider: { width: '100%', height: 20, marginTop: 10 },
});
