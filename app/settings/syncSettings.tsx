// app/settings/sync.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { RefreshCw, Trash2, Upload, Cloud, CloudOff } from 'lucide-react-native';
import { useSync } from '@/contexts/SyncContext';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function SyncSettingsScreen() {
  const { syncStatus, pendingCount, lastSyncedAt, isSyncing, isSyncEnabled, syncNow, doInitialUpload, doForceResync, resetSync } = useSync();
  const { isAuthenticated } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleForceResync = useCallback(() => {
    Alert.alert('Force Re-Sync', 'Clear sync history and re-download everything?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Re-Sync', style: 'destructive', onPress: () => doForceResync() },
    ]);
  }, [doForceResync]);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    try { const c = await doInitialUpload(); Alert.alert('Done', `Uploaded ${c} records.`); }
    catch (e: any) { Alert.alert('Error', e.message); }
    finally { setUploading(false); }
  }, [doInitialUpload]);

  const handleClear = useCallback(() => {
    Alert.alert('Clear Sync', 'Clear queue and disconnect realtime? Local data stays.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: resetSync },
    ]);
  }, [resetSync]);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        <View style={s.row}>{isSyncEnabled ? <Cloud color={Colors.accent.gold} size={20}/> : <CloudOff color={Colors.text.tertiary} size={20}/>}<Text style={s.title}>{isSyncEnabled ? 'Sync Enabled' : 'Sync Disabled'}</Text></View>
        {!isAuthenticated && <Text style={s.desc}>Sign in to enable sync.</Text>}
        {isAuthenticated && (<View style={s.stats}><View style={s.stat}><Text style={s.label}>Status</Text><Text style={s.val}>{isSyncing ? 'Syncing...' : syncStatus}</Text></View><View style={s.stat}><Text style={s.label}>Pending</Text><Text style={s.val}>{pendingCount}</Text></View><View style={s.stat}><Text style={s.label}>Last sync</Text><Text style={s.val}>{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Never'}</Text></View></View>)}
      </View>
      {isAuthenticated && (<>
        <TouchableOpacity style={[s.btn, isSyncing && s.dis]} onPress={syncNow} disabled={isSyncing}>{isSyncing ? <ActivityIndicator color={Colors.accent.gold} size="small"/> : <RefreshCw color={Colors.accent.gold} size={18}/>}<Text style={s.btnTxt}>Sync Now</Text></TouchableOpacity>
        <TouchableOpacity style={[s.btn, uploading && s.dis]} onPress={handleUpload} disabled={uploading}>{uploading ? <ActivityIndicator color={Colors.accent.gold} size="small"/> : <Upload color={Colors.accent.gold} size={18}/>}<Text style={s.btnTxt}>Upload Local Data</Text></TouchableOpacity>
        <TouchableOpacity style={s.btn} onPress={handleForceResync}><RefreshCw color={Colors.status.warning} size={18}/><Text style={[s.btnTxt,{color:Colors.status.warning}]}>Force Full Re-Sync</Text></TouchableOpacity>
        <TouchableOpacity style={s.btn} onPress={handleClear}><Trash2 color={Colors.status.error} size={18}/><Text style={[s.btnTxt,{color:Colors.status.error}]}>Clear Sync Data</Text></TouchableOpacity>
      </>)}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.bg.primary},content:{padding:20,paddingBottom:40},
  card:{backgroundColor:Colors.bg.card,borderRadius:12,padding:16,marginBottom:24,borderWidth:0.5,borderColor:Colors.border.subtle},
  row:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8},title:{fontSize:16,fontWeight:'600',color:Colors.text.primary},
  desc:{fontSize:13,color:Colors.text.secondary,marginTop:4},stats:{marginTop:12,gap:8},
  stat:{flexDirection:'row',justifyContent:'space-between'},label:{fontSize:13,color:Colors.text.secondary},val:{fontSize:13,color:Colors.text.primary,fontWeight:'500'},
  btn:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:Colors.bg.card,borderRadius:12,padding:16,marginBottom:12,borderWidth:0.5,borderColor:Colors.border.subtle},
  dis:{opacity:0.5},btnTxt:{fontSize:15,fontWeight:'500',color:Colors.accent.gold},
});
