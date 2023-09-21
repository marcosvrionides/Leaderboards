import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState } from 'react'
import Colours from './Colours'

const Home = () => {

    const [isExpanded, setIsExpanded] = useState(false);

    const dummyLeaderboardData = [
        { id: 1, player: 'John', wins: 10, losses: 5 },
        { id: 2, player: 'Alice', wins: 8, losses: 7 },
        { id: 3, player: 'Bob', wins: 12, losses: 3 },
        { id: 4, player: 'Eve', wins: 6, losses: 9 },
        { id: 5, player: 'Charlie', wins: 14, losses: 2 },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Backgammon</Text>
            <View style={[styles.leaderboardContainer, isExpanded && { height: 'fit-content' },
            ]}>
                <Text style={styles.leaderboardTitle}>Leaderboard</Text>
                <View style={styles.tableHeaderRow}>
                    <Text style={[styles.columnHeader, styles.narrowColumn]}>#</Text>
                    <Text style={styles.columnHeader}>Player</Text>
                    <Text style={styles.columnHeader}>Wins</Text>
                    <Text style={styles.columnHeader}>Loses</Text>
                </View>
                {dummyLeaderboardData.map((item, index) => (
                    <View style={styles.tableRow} key={item.id}>
                        <Text style={[styles.tableCell, styles.narrowColumn]}>{index + 1}</Text>
                        <Text style={styles.tableCell}>{item.player}</Text>
                        <Text style={styles.tableCell}>{item.wins}</Text>
                        <Text style={styles.tableCell}>{item.losses}</Text>
                    </View>
                ))}
            </View>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
                <Text>{isExpanded ? 'hide - ' : 'show more +'}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Home

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: Colours.background,
        height: '100%',
        display: 'flex',
        gap: 20
    },
    title: {
        fontFamily: 'times new roman',
        fontSize: 30,
        fontWeight: 'bold',
        color: Colours.text,
    },
    leaderboardContainer: {
        height: 250,
        width: '100%',
        backgroundColor: Colours.secondary,
        borderRadius: 10,
        elevation: 7,
        padding: 10,
        overflow: 'hidden'
    },
    leaderboardTitle: {
        fontSize: 28,
        color: Colours.text,
        fontFamily: 'times new roman',
    },
    tableHeaderRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        borderBottomWidth: 1,
        paddingVertical: 5
    },
    columnHeader: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: Colours.text,
        textAlign: 'center',
    },
    narrowColumn: {
        flex: 0.25,
    },
    tableRow: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingVertical: 5,
    },
    tableCell: {
        flex: 1,
        fontSize: 16,
        color: Colours.text,
        textAlign: 'center',
    },
})