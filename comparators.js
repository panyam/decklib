
/**
 * A few utility functions to allow different kinds of comparison of cards and a list of cards.
 */
DeckLib.Comparators = (function(dc) {
    /**
     * Top level method to compare two hands.
     */
    dc.compareCardLists = function(h1, h2, comparator) {
        var l = Math.min(h1.length, h2.length);
        for (var i = 0;i < l;i++) {
            var res = comparator(h1[i], h2[i]);
            if (res != 0) return res;
        }
        return h1.length - h2.length;
    }

    dc.compareHands = function(h1, h2) {
        if (h1.rank != h2.rank) return h1.rank - h2.rank;
        return h1.compareTo(h2);
    };

    /**
     * A comparator function to order two cards in ascending order of
     * their values.
     */
    dc.ByCardValueAsc = function(c1, c2) {
        return c1.value - c2.value;
    };

    /**
     * A comparator function to order two cards in descending order of
     * their values.
     */
    dc.ByCardValueDesc = function(c1, c2) {
        return c2.value - c1.value;
    };

    /**
     * Compare two cards and order by suit and then by value 
     * in ascending order.
     */
    dc.BySuitAndCardValueAsc = function(c1, c2) {
        if (c1.suit == c2.suit) {
            return c1.value - c2.value;
        }
        return c1.suit - c2.suit;
    };

    /**
     * Compare two cards and order by suit and then by value 
     * in descending order.
     */
    dc.BySuitAndCardValueDesc = function(c1, c2) {
        if (c1.suit == c2.suit) {
            return c2.value - c1.value;
        }
        return c2.suit - c1.suit;
    };
    return dc;
}(DeckLib.Comparators || {}));

