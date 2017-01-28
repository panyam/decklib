
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
        dl.replaceCardValues(cards, dl.ACE_MINOR, dl.ACE_MAJOR);
        cards.sort(dc.CardValueCompareDesc);
        var handData = cards;
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
     * A poker hand that consists of N tuples each with m of a kind, followed by single cards.
     * Ideal for building 2 pairs, 3 pairs, 1 pair, 3 of a kind, 4 of a kind etc
     */
    dh.NOfAKindBuilder = function(handName, nofakind, minCount, maxCount) {
        return function(cards) {
            /**
             * Make sure ACEs are of "high" value.
             */
            dl.replaceCardValues(cards, dl.ACE_MINOR, dl.ACE_MAJOR);
            cards.sort(dc.ByCardValueDesc);

            if (typeof(minCount) === "undefined") {
                minCount = 1;
                maxCount = -1;
            }

            if (typeof(maxCount) === "undefined") {
                maxCount = -1;
            }

            var N = cards.length;
            var kinds = [];
            var remaining_cards = [];
            var currkind = [];
            var start = 0;
            var end = 0;
            while (start < N) {
                while (end < N && cards[end].value == cards[start].value) {
                    end ++;
                }
                // everything from start to end inclusive is the same kind of card
                var slice = cards.slice(start, end);
                if (slice.length >= nofakind) {
                    kinds.push(slice.slice(0, nofakind));
                    remaining_cards = remaining_cards.concat(slice.slice(nofakind));
                } else {
                    remaining_cards = remaining_cards.concat(slice);
                }
                start = end;
            }
            if (minCount > 0 && kinds.length < minCount) {
                // We want no less than minCount number of tuples
                return null;
            }
            if (maxCount > 0 && kinds.length > maxCount) {
                // We want no more than maxCount number of tuples
                return null;
            }

            var handData = {
                "tuples": kinds,
                "remaining_cards": remaining_cards
            };
            return new dl.Hand(0, handName, handData, function(h1, h2) {
                h1 = h1.data();
                h2 = h2.data();
                if (h1.tuples.length != h2.tuples.length) {
                    return h1.tuples.length - h2.tuples.length;
                }

                for (var i = 0;i < h1.tuples.length;i++) {
                    var res = dc.compareCardLists(h1.tuples[i], h2.tuples[i], dc.ByCardValueAsc);
                    if (res != 0) return res;
                }
                return dc.compareCardLists(h1.remaining_cards, h2.remaining_cards, dc.ByCardValueAsc);
            });
        }
    };

    /**
     * A builder for full houses (N and M card groups).
     */
    dh.FullHouseBuilder = function(handName, ncards, mcards) {
        return function(cards) {
            /**
             * Make sure ACEs are of "high" value.
             */
            dl.replaceCardValues(cards, dl.ACE_MINOR, dl.ACE_MAJOR);
            cards.sort(dc.ByCardValueDesc);

            var N = cards.length;
            var ncard_list = [];
            var mcard_list = [];
            var remaining_cards = [];

            var start = 0;
            var end = 0;
            while (start < N) {
                while (end < N && cards[end].value == cards[start].value) {
                    end ++;
                }

                var slice = cards.slice(start, end);
                if (ncard_list.length == 0 && slice.length >= ncards) {
                    ncard_list = slice.slice(0, ncards);
                    remaining_cards = remaining_cards.concat(slice.slice(ncards));
                } else if (mcard_list.length == 0 && slice.length >= mcards) {
                    mcard_list = slice.slice(0, mcards);
                    remaining_cards = remaining_cards.concat(slice.slice(mcards));
                } else {
                    remaining_cards = remaining_cards.concat(slice);
                }
                start = end;
            }

            if (mcard_list.length != mcards || ncard_list.length != ncards) return null;

            var handData = {
                "ncard_list": ncard_list,
                "mcard_list": mcard_list,
                "remaining_cards": remaining_cards
            };

            return new dl.Hand(0, handName, handData, function(h1, h2) {
                h1 = h1.data();
                h2 = h2.data();
                if (h1.ncard_list.length != h2.ncard_list.length) {
                    return h1.ncard_list.length - h2.ncard_list.length;
                }
                if (h1.mcard_list.length != h2.mcard_list.length) {
                    return h1.mcard_list.length - h2.mcard_list.length;
                }

                res = dc.compareCardLists(h1.ncard_list, h2.ncard_list, dc.ByCardValueAsc);
                if (res != 0) return res;
                res = dc.compareCardLists(h1.mcard_list, h2.mcard_list, dc.ByCardValueAsc);
                if (res != 0) return res;
                res = dc.compareCardLists(h1.remaining_cards, h2.remaining_cards, dc.ByCardValueAsc);
            });
        }
    };

    /**
     * A builder of flushes (ncards of the same suit).
     */
    dh.FlushBuilder = function(handName, ncards) {
        return function(cards) {
            /**
             * Make sure ACEs are of "high" value.
             */
            dl.replaceCardValues(cards, dl.ACE_MINOR, dl.ACE_MAJOR);
            cards.sort(dc.BySuitAndCardValueDesc);

            var flush_cards = [];
            var remaining_cards = [];

            var N = cards.length;
            var start = 0;
            var end = 0;
            while (start < N) {
                while (end < N && cards[end].suit == cards[start].suit) {
                    end ++;
                }
                // everything from start to end inclusive is the same kind of card
                var slice = cards.slice(start, end);
                if (flush_cards.length == 0 && slice.length >= ncards) {
                    flush_cards = slice.slice(0, ncards);
                    remaining_cards = remaining_cards.concat(slice.slice(ncards));
                } else {
                    remaining_cards = remaining_cards.concat(slice);
                }
                start = end;
            }

            if (flush_cards.length != ncards) return null;

            var handData = {
                "flush_cards": flush_cards,
                "remaining_cards": remaining_cards
            };

            return new dl.Hand(0, handName, handData, function(h1, h2) {
                h1 = h1.data();
                h2 = h2.data();
                if (h1.flush_cards.length != h2.flush_cards.length) {
                    return h1.flush_cards.length - h2.flush_cards.length;
                }

                res = dc.compareCardLists(h1.flush_cards, h2.flush_cards, dc.ByCardValueAsc);
                if (res != 0) return res;
                res = dc.compareCardLists(h1.remaining_cards, h2.remaining_cards, dc.ByCardValueAsc);
            });
        }
    };

    /**
     * A generic functor to return a sequence of n cards in order, with further grouping 
     * constraints as specified by the grouperFunc.
     */
    dh.StraightBuilder = function(handName, ncards, grouperFunc) {
        return function(cards) {
            var straight_cards = [];
            var remaining_cards = [];

            var aceCards = []
            var cardsByValue = [];
            for (var i = 0;i < 15;i++) cardsByValue.push([]);
            for (var c in cards) {
                var card = cards[c];
                if (card.isAce()) aceCards.push(card);
                else cardsByValue[card.value].push(card);
            }

            // Starting from top see if we can make a ncard run
            // form groups of ncards - 1 (instead of ncards)
            var curr = dl.KING;
            while (curr > 0) {
                if (straight_cards.length > 0) {
                    // we have found the run, so add this to the remaining cards
                    while (cardsByValue[curr].length > 0) {
                        remaining_cards.unshift(cardsByValue[curr].pop());
                    }
                    curr --;
                } else {
                    // see if we have a group of ncards starting from curr, curr - 1, curr - 2 .... curr - ncards - 1
                    var end = curr;
                    var runlength = ncards - 1;
                    if (curr != dl.KING && curr != ncards) runlength ++;
                    for (var i = 0;i < runlength;i++) {
                        if (cardsByValue[end].length == 0) {
                            break;
                        }
                        end--;
                    }

                    // end -> curr (inclusive) denotes a run of cards
                    var found = false;
                    end ++;
                    if (1 + curr - end == runlength) {
                        // ncards (or -1) cards were found as required so we can do the grouping
                        var groups = cardsByValue.slice(end, curr + 1).reverse();
                        if (curr == dl.KING) {
                            aceCards.forEach(function(card) { card.value = dl.ACE_MAJOR; });
                            groups.unshift(aceCards);
                        } else if (curr == ncards) {
                            aceCards.forEach(function(card) { card.value = dl.ACE_MINOR; });
                            groups.push(aceCards);
                        } else {
                            // use as is
                        }
                        found = grouperFunc(groups, straight_cards);
                    }

                    if (!found) {
                        // pop off the largest card as it wont be part of a run
                        while (cardsByValue[curr].length > 0) {
                            remaining_cards.unshift(cardsByValue[curr].pop());
                        }
                        curr --;
                    }
                }
            }
            if (straight_cards.length != ncards) {
                return null;
            }

            // Add all remaining ace cards to the start
            while (aceCards.length > 0) {
                var card = aceCards.pop();
                card.value = dl.ACE_MAJOR;
                remaining_cards.unshift(card);
            }

            var handData = {
                "straight_cards": straight_cards,
                "remaining_cards": remaining_cards
            };

            return new dl.Hand(0, handName, handData, function(h1, h2) {
                h1 = h1.data();
                h2 = h2.data();
                if (h1.straight_cards.length != h2.straight_cards.length) {
                    return h1.straight_cards.length - h2.straight_cards.length;
                }

                res = dc.compareCardLists(h1.straight_cards, h2.straight_cards, dc.ByCardValueAsc);
                if (res != 0) return res;
                res = dc.compareCardLists(h1.remaining_cards, h2.remaining_cards, dc.ByCardValueAsc);
            });
        }
    };

    /**
     * A variation of the StraightBuilder that ensures a simple Straight.
     */
    dh.DefaultStraightBuilder = function(handName, ncards) {
        return dh.StraightBuilder(handName, ncards, function(groups, output_run) {
            // we know we have N straight cards, we can take *any* of it 
            for (var g in groups) {
                output_run.push(groups[g].pop());
            }
            return true;
        });
    };

    /**
     * A variation of the StraightBuilder that ensures a Straight Flush.
     */
    dh.StraightFlushBuilder = function(handName, ncards) {
        return dh.StraightBuilder(handName, ncards, function(groups, output_run) {
            var out = dh._findCommonSuit(groups);
            var remaining_suits = out[0];
            var the_suit = out[1];
            if (the_suit == null) return false;

            for (var i = 0;i < groups.length;i++) {
                var group = groups[i];
                var cardIndex = remaining_suits[i][the_suit];
                output_run.push(group[cardIndex]);
                group.splice(cardIndex, 1);
            }
            return true;
        });
    };

    /**
     * A variation of the StraightBuilder that ensures a RoyalFlush.
     */
    dh.RoyalFlushBuilder = function(handName, ncards) {
        return dh.StraightBuilder(handName, ncards, function(groups, output_run) {
            // highest card HAS to be an ace in a royal flush
            if (!groups[0][0].isAce()) return false;

            var out = dh._findCommonSuit(groups);
            var remaining_suits = out[0];
            var the_suit = out[1];
            if (the_suit == null) return false;

            for (var i = 0;i < groups.length;i++) {
                var group = groups[i];
                var cardIndex = remaining_suits[i][the_suit];
                output_run.push(group[cardIndex]);
                group.splice(cardIndex, 1);
            }
            return true;
        });
    };

    dh._findCommonSuit = function(groups) {
        var remaining_suits = [];
        var the_suit = null;
        for (var i = 0;i < groups.length;i++) {
            remaining_suits.push({});
            var group = groups[i];
            for (var c in group) {
                var card = group[c];
                if (i == 0 || card.suit in remaining_suits[i - 1]) {
                    var suit = group[c].suit;
                    remaining_suits[i][suit] = c;
                    if (the_suit == null && i == groups.length - 1) {
                        the_suit = suit;
                    }
                }
            }
        }
        return [remaining_suits, the_suit];
    }

    return dh;
}(DeckLib.DefaultHands || {}));

