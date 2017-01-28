
/**
 * A collection of standard hand types in poker.
 */
DeckLib.PokerHands = (function(dh) {
    var dl = DeckLib;
    var dc = DeckLib.Comparators;

    /**
     * A poker hand where the Highest card wins.
     */
    dh.HighestCardBuilder = function(cards) {
        cards.forEach(function(card, index) {
            if (card.value == ACE_MINOR) {
                card.value = ACE_MAJOR;
            }
        });
        var handData = cards;
        cards.sort(dlib.CardValueCompareDesc);
        return new dl.Hand(0, "HighestCard", handData, function(h1, h2) {
            h1 = h1.data();
            h2 = h2.data();
            var l = Math.min(h1.length, h2.length);
            for (var i = 0;i < l;i++) {
                if (h1[i] != h2[i]) {
                    return h1[i] - h2[i];
                }
            }
            return h1.length - h2.length;
        });
    };

    /**
     * A poker hand that consists of N pairs followed by single cards.
     */
    dh.NPairsBuilder = function(npairs, handName) {
        return function(cards) {
            /**
             * Make sure ACEs are of "high" value.
             */
            cards.forEach(function(card, index) {
                if (card.value == ACE_MINOR) {
                    card.value = ACE_MAJOR;
                }
            });

            cards.sort(dc.ByCardValueDesc);
            var last = null;
            var N = cards.length;
            var pairs = [];
            var remaining_cards = [];
            for (var i = 0;i < N;i++) {
                if (last == null) {
                    last = card;
                } else if (card.value != last.value) {
                    if (i == N - 1) {
                        remaining_cards.push(card);
                    } else {
                        last = card;
                    }
                    last = card;
                } else {
                    pairs.push([last, card]);
                    last = null;
                }
            }
            if (length(pairs) != npairs) {
                // We want npairs, no more, no less.
                return null;
            }

            var handData = {
                "pairs": pairs,
                "remaining_cards": remaining_cards
            };
            return new Hand(0, handName, handData, function(h1, h2) {
                h1 = h1.data();
                h2 = h2.data();
                if (h1.pairs.length != h2.pairs.length) {
                    return h1.pairs.length - h2.pairs.length;
                }

                for (var i = 0;i < h1.pairs.length;i++) {
                    var res = dc.compareCardLists(h1.pairs[i], h2.pairs[i], dc.ByCardValueAsc);
                    if (res != 0) return res;
                }
                return dc.compareCompareCardLists(h1.remaining_cards, h2.remaining_cards, dc.ByCardValueAsc);
            });
        }
    }

    return dh;
}(DeckLib.DefaultHands || {}));

